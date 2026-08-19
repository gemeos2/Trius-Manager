"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanList } from "./KanbanList";
import { KanbanCard } from "./KanbanCard";
import { CardDetailModal } from "./CardDetailModal";
import { QuickFilters, type FilterKey } from "./QuickFilters";
import { useToast } from "@/components/ui/ToastProvider";
import {
  archiveList as archiveListAction,
  createCard as createCardAction,
  createList as createListAction,
  moveCard as moveCardAction,
  renameList as renameListAction,
  reorderCards as reorderCardsAction,
  reorderLists as reorderListsAction,
} from "@/app/gestao/(dashboard)/kanban/[boardId]/actions";
import type { BoardWithLists, CardSummary, ListWithCards } from "@/lib/kanban/types";

export function KanbanBoard({ initialData, currentUserId }: { initialData: BoardWithLists; currentUserId: string }) {
  const [lists, setLists] = useState<ListWithCards[]>(initialData.lists);
  const [activeCard, setActiveCard] = useState<CardSummary | null>(null);
  const [addingList, setAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const openCardId = searchParams.get("card");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const filteredLists = useMemo(() => {
    if (filter === "all") return lists;
    const today = new Date().toISOString().slice(0, 10);
    return lists.map((list) => ({
      ...list,
      cards: list.cards.filter((card) => {
        switch (filter) {
          case "mine":
            return card.members.some((m) => m.id === currentUserId);
          case "overdue":
            return card.dueDate !== null && card.dueDate < today && card.status !== "concluido";
          case "today":
            return card.dueDate === today;
          case "high-priority":
            return card.priority === "alta" || card.priority === "urgente";
          case "unassigned":
            return card.members.length === 0;
          default:
            return true;
        }
      }),
    }));
  }, [lists, filter, currentUserId]);

  function openCard(cardId: string) {
    const params = new URLSearchParams(searchParams);
    params.set("card", cardId);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  function closeCard() {
    const params = new URLSearchParams(searchParams);
    params.delete("card");
    router.push(params.toString() ? `?${params.toString()}` : "?", { scroll: false });
  }

  const rollbackTo = useCallback((snapshot: ListWithCards[]) => setLists(snapshot), []);

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    if (active.data.current?.type === "card") {
      const card = lists.flatMap((l) => l.cards).find((c) => c.id === active.id);
      setActiveCard(card ?? null);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const snapshot = lists;

    if (active.data.current?.type === "list") {
      if (active.id === over.id) return;
      if (String(active.id).startsWith("temp-") || String(over.id).startsWith("temp-")) return;
      const oldIndex = lists.findIndex((l) => l.id === active.id);
      const newIndex = lists.findIndex((l) => l.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(lists, oldIndex, newIndex);
      setLists(reordered);

      try {
        await reorderListsAction(initialData.id, reordered.map((l) => l.id));
      } catch {
        rollbackTo(snapshot);
        showToast("Não foi possível reordenar as listas — tente novamente.");
      }
      return;
    }

    if (active.data.current?.type === "card") {
      const sourceList = lists.find((l) => l.cards.some((c) => c.id === active.id));
      if (!sourceList) return;

      const overIsCard = over.data.current?.type === "card";
      const targetListId = overIsCard ? (over.data.current?.listId as string) : String(over.id);
      const targetList = lists.find((l) => l.id === targetListId);
      if (!targetList) return;

      // Lista ainda salvando (ID temporário) — não é um destino válido ainda.
      if (targetList.id.startsWith("temp-") || String(active.id).startsWith("temp-")) {
        showToast("Aguarde a lista terminar de salvar antes de mover o card.");
        return;
      }

      if (sourceList.id === targetList.id) {
        const oldIndex = sourceList.cards.findIndex((c) => c.id === active.id);
        const newIndex = overIsCard ? sourceList.cards.findIndex((c) => c.id === over.id) : sourceList.cards.length - 1;
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

        const reorderedCards = arrayMove(sourceList.cards, oldIndex, newIndex);
        setLists(lists.map((l) => (l.id === sourceList.id ? { ...l, cards: reorderedCards } : l)));

        try {
          await reorderCardsAction(initialData.id, sourceList.id, reorderedCards.map((c) => c.id));
        } catch {
          rollbackTo(snapshot);
          showToast("Não foi possível reordenar os cards — tente novamente.");
        }
        return;
      }

      // move entre listas
      const card = sourceList.cards.find((c) => c.id === active.id);
      if (!card) return;

      const targetPosition = overIsCard ? targetList.cards.findIndex((c) => c.id === over.id) : targetList.cards.length;

      const newSourceCards = sourceList.cards.filter((c) => c.id !== active.id);
      const movedCard = { ...card, listId: targetList.id };
      const newTargetCards = [...targetList.cards];
      newTargetCards.splice(targetPosition < 0 ? newTargetCards.length : targetPosition, 0, movedCard);

      setLists(
        lists.map((l) => {
          if (l.id === sourceList.id) return { ...l, cards: newSourceCards };
          if (l.id === targetList.id) return { ...l, cards: newTargetCards };
          return l;
        })
      );

      try {
        await moveCardAction(initialData.id, card.id, targetList.id, Math.max(targetPosition, 0));
      } catch {
        rollbackTo(snapshot);
        showToast("Não foi possível mover o card — tente novamente.");
      }
    }
  }

  async function handleAddList() {
    const name = newListName.trim();
    if (!name) { setAddingList(false); return; }

    const tempId = `temp-${Date.now()}`;
    setLists([...lists, { id: tempId, boardId: initialData.id, name, position: lists.length, cards: [] }]);
    setNewListName("");
    setAddingList(false);

    try {
      const realId = await createListAction(initialData.id, name);
      setLists((current) => current.map((l) => (l.id === tempId ? { ...l, id: realId } : l)));
    } catch {
      setLists((current) => current.filter((l) => l.id !== tempId));
      showToast("Não foi possível criar a lista — tente novamente.");
    }
  }

  async function handleAddCard(listId: string, title: string) {
    const snapshot = lists;
    const tempId = `temp-${Date.now()}`;
    const tempCard: CardSummary = {
      id: tempId,
      listId,
      title,
      description: null,
      status: "aberto",
      priority: "media",
      position: 999,
      startDate: null,
      dueDate: null,
      clientId: null,
      clientName: null,
      projectId: null,
      projectName: null,
      coverColor: null,
      members: [],
      labels: [],
      checklistTotal: 0,
      checklistDone: 0,
      commentCount: 0,
    };
    setLists(lists.map((l) => (l.id === listId ? { ...l, cards: [...l.cards, tempCard] } : l)));

    try {
      const realId = await createCardAction(initialData.id, listId, title);
      setLists((current) =>
        current.map((l) =>
          l.id === listId ? { ...l, cards: l.cards.map((c) => (c.id === tempId ? { ...c, id: realId } : c)) } : l
        )
      );
    } catch {
      rollbackTo(snapshot);
      showToast("Não foi possível criar o card — tente novamente.");
    }
  }

  async function handleRenameList(listId: string, name: string) {
    const snapshot = lists;
    setLists(lists.map((l) => (l.id === listId ? { ...l, name } : l)));
    try {
      await renameListAction(initialData.id, listId, name);
    } catch {
      rollbackTo(snapshot);
      showToast("Não foi possível renomear a lista — tente novamente.");
    }
  }

  async function handleArchiveList(listId: string) {
    const snapshot = lists;
    setLists(lists.filter((l) => l.id !== listId));
    try {
      await archiveListAction(initialData.id, listId);
    } catch {
      rollbackTo(snapshot);
      showToast("Não foi possível arquivar a lista — tente novamente.");
    }
  }

  return (
    <>
      <QuickFilters value={filter} onChange={setFilter} />

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="kanban-columns">
          <SortableContext items={lists.map((l) => l.id)} strategy={horizontalListSortingStrategy}>
            {filteredLists.map((list) => (
              <KanbanList
                key={list.id}
                list={list}
                onOpenCard={openCard}
                onAddCard={handleAddCard}
                onRenameList={handleRenameList}
                onArchiveList={handleArchiveList}
              />
            ))}
          </SortableContext>

          <div className="kanban-add-list-form">
            {addingList ? (
              <input
                className="ds-input"
                placeholder="Nome da lista"
                value={newListName}
                autoFocus
                onChange={(e) => setNewListName(e.target.value)}
                onBlur={handleAddList}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddList();
                  if (e.key === "Escape") { setNewListName(""); setAddingList(false); }
                }}
              />
            ) : (
              <button type="button" className="t-body-sm" style={{ color: "var(--off-blue-60)" }} onClick={() => setAddingList(true)}>
                + Adicionar lista
              </button>
            )}
          </div>
        </div>

        <DragOverlay>{activeCard && <KanbanCard card={activeCard} onOpen={() => {}} />}</DragOverlay>
      </DndContext>

      {openCardId && <CardDetailModal boardId={initialData.id} cardId={openCardId} onClose={closeCard} />}
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { createClientSegmentAction } from "@/app/gestao/(dashboard)/clientes/actions";
import type { ClientSegment } from "@/lib/clientes/types";

const NEW_SEGMENT_VALUE = "__new__";

interface SegmentFieldProps {
  id: string;
  segments: ClientSegment[];
  defaultValue?: string;
}

export function SegmentField({ id, segments, defaultValue = "" }: SegmentFieldProps) {
  const [options, setOptions] = useState(segments);
  const [selected, setSelected] = useState(defaultValue);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSelectChange(value: string) {
    if (value === NEW_SEGMENT_VALUE) {
      setCreating(true);
      return;
    }
    setSelected(value);
  }

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    startTransition(async () => {
      const segment = await createClientSegmentAction(name);
      setOptions((prev) => (prev.some((s) => s.id === segment.id) ? prev : [...prev, segment].sort((a, b) => a.name.localeCompare(b.name))));
      setSelected(segment.id);
      setCreating(false);
      setNewName("");
    });
  }

  if (creating) {
    return (
      <div className="ds-field">
        <label htmlFor={`${id}-new`}>Novo nicho</label>
        <div className="segment-new-row">
          <input
            id={`${id}-new`}
            className="ds-input"
            placeholder="Ex: Pet Shop"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreate();
              }
            }}
            autoFocus
          />
          <button type="button" className="t-helper" disabled={pending} onClick={handleCreate}>
            {pending ? "Criando…" : "Salvar"}
          </button>
          <button type="button" className="t-helper" disabled={pending} onClick={() => { setCreating(false); setNewName(""); }}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ds-field">
      <label htmlFor={id}>Nicho</label>
      <div className="input-frame">
        <select id={id} name="segment_id" className="ds-input" value={selected} onChange={(e) => handleSelectChange(e.target.value)}>
          <option value="">Sem nicho</option>
          {options.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
          <option value={NEW_SEGMENT_VALUE}>+ Novo nicho…</option>
        </select>
      </div>
    </div>
  );
}

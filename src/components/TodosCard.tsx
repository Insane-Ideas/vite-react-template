import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import supabase from "../supabaseClient";
import type { Todo } from "../types/todo";

type TodosCardProps = {
  session: Session | null;
};

export default function TodosCard({ session }: TodosCardProps) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todosError, setTodosError] = useState<string | null>(null);

  useEffect(() => {
    async function getTodos() {
      if (!session) {
        setTodos([]);
        return;
      }

      setTodosError(null);

      const { data, error } = await supabase.from("todos").select();

      if (error) {
        setTodosError(error.message);
        return;
      }

      setTodos((data ?? []) as Todo[]);
    }

    void getTodos().catch((e) =>
      setTodosError(e instanceof Error ? e.message : String(e))
    );
  }, [session]);

  return (
    <div className="w-full rounded-xl border border-white/10 bg-white/5 p-6 text-left sm:p-8">
      {todosError && <p className="text-rose-400">{todosError}</p>}
      {todos.length === 0 ? (
        <p>{session ? "No todos yet." : "No todos (sign in required)."}</p>
      ) : (
        <ul className="list-disc space-y-1 pl-6">
          {todos.map((todo) => (
            <li key={todo.id}>{todo.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}


import { Suspense } from "react";
import UsersClient from "./UsersClient";

export const revalidate = 60;

type RawUser = { id: number; name: string; email: string; website: string };
type Post = { userId: number };
type Todo = { userId: number; completed: boolean };

export type EnrichedUser = RawUser & {
  totalPosts: number;
  completedTodos: number;
  pendingTodos: number;
};

async function getData() {
  const [usersRes, postsRes, todosRes] = await Promise.all([
    fetch("https://jsonplaceholder.typicode.com/users"),
    fetch("https://jsonplaceholder.typicode.com/posts"),
    fetch("https://jsonplaceholder.typicode.com/todos"),
  ]);
  if (!usersRes.ok)
    throw new Error(`Failed to fetch users (${usersRes.status})`);
  if (!postsRes.ok)
    throw new Error(`Failed to fetch posts (${postsRes.status})`);
  if (!todosRes.ok)
    throw new Error(`Failed to fetch todos (${todosRes.status})`);

  const [users, posts, todos]: [RawUser[], Post[], Todo[]] = await Promise.all([
    usersRes.json(),
    postsRes.json(),
    todosRes.json(),
  ]);
  return { users, posts, todos };
}

export default async function UsersPage() {
  const { users, posts, todos } = await getData();

  const postCounts: Record<number, number> = {};
  const doneCounts: Record<number, number> = {};
  const pendingCounts: Record<number, number> = {};

  for (const p of posts) postCounts[p.userId] = (postCounts[p.userId] ?? 0) + 1;
  for (const t of todos) {
    if (t.completed) doneCounts[t.userId] = (doneCounts[t.userId] ?? 0) + 1;
    else pendingCounts[t.userId] = (pendingCounts[t.userId] ?? 0) + 1;
  }

  const enriched: EnrichedUser[] = users.map((u) => ({
    ...u,
    totalPosts: postCounts[u.id] ?? 0,
    completedTodos: doneCounts[u.id] ?? 0,
    pendingTodos: pendingCounts[u.id] ?? 0,
  }));

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Users
      </h1>
      <Suspense>
        <UsersClient users={enriched} />
      </Suspense>
    </main>
  );
}

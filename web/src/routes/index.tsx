import { createFileRoute, redirect } from '@tanstack/react-router';

import { Error404 } from '@/components/Error404';

export const Route = createFileRoute('/')({
  component: RouteComponent,
  notFoundComponent: Error404,
  beforeLoad: () => {
    throw redirect({ to: '/settings' });
  },
});

function RouteComponent() {
  return null;
}

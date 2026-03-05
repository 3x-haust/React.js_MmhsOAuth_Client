export type NavigationItem = {
  id: string;
  label: string;
  to: string;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
};

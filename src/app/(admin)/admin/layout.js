export const metadata = {
  title: {
    default: "Panel Admin",
    template: "%s | Admin PABE",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminDashboardLayout({ children }) {
  return children;
}

import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { AuthFormSkeleton } from "@/components/auth/AuthFormSkeleton";

export default function AuthLoading() {
  return (
    <AuthSplitLayout>
      <AuthFormSkeleton mode="login" />
    </AuthSplitLayout>
  );
}

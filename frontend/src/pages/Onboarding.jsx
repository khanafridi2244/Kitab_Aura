import { useNavigate } from "react-router-dom";
import PreferencesForm from "../components/PreferencesForm";
import { useAuth } from "../hooks/useAuth";

// Shown once, right after signing up
export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-primary">Welcome, {user.name.split(" ")[0]}!</h1>
        <p className="mt-1 text-sm text-muted">
          Tell us what you like to read and we will recommend books for you. You can change this any time on your
          profile.
        </p>

        <div className="mt-6">
          <PreferencesForm
            submitLabel="Save and continue"
            onSaved={() => navigate("/")}
            onSkip={() => navigate("/")}
          />
        </div>
      </div>
    </div>
  );
}
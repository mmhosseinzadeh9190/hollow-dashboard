import React from "react";
import Button from "../../ui/Button";
import toast from "react-hot-toast";

interface SocialAuthButtonsProps {
  isPending: boolean;
  handleFacebookAuth: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleTwitterAuth: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleGitHubAuth: (e: React.MouseEvent<HTMLButtonElement>) => void;
  actionType: "login" | "signup";
}

function SocialAuthButtons({
  isPending,
  handleFacebookAuth,
  handleTwitterAuth,
  handleGitHubAuth,
  actionType,
}: SocialAuthButtonsProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex w-full gap-4">
        <Button
          onClick={() =>
            toast.error("Unfortunately, Facebook is currently unavailable.")
          }
          disabled={isPending}
          className="flex w-1/2 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-200"
        >
          <img
            src="/src/assets/facebook.svg"
            alt=""
            role="button"
            className="h-5"
          />
          <span>
            {actionType === "signup"
              ? "Sign up with Facebook"
              : "Log in with Facebook"}
          </span>
        </Button>

        <Button
          onClick={() =>
            toast.error("Unfortunately, X is currently unavailable.")
          }
          disabled={isPending}
          className="flex w-1/2 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-200"
        >
          <img src="/src/assets/x.svg" alt="" role="button" className="h-5" />
          <span>
            {actionType === "signup" ? "Sign up with X" : "Log in with X"}
          </span>
        </Button>
      </div>

      <Button
        onClick={handleGitHubAuth}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-200"
      >
        <img
          src="/src/assets/github.svg"
          alt=""
          role="button"
          className="h-5"
        />
        <span>
          {actionType === "signup"
            ? "Sign up with Github"
            : "Log in with Github"}
        </span>
      </Button>
    </div>
  );
}

export default SocialAuthButtons;

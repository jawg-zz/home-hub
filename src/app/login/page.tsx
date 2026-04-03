import LoginForm from "./LoginForm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)",
        padding: "1rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              marginBottom: "0.5rem",
              background: "linear-gradient(135deg, #00d4aa 0%, #00a88a 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            🏠 Home Hub
          </h1>
          <p style={{ color: "#666" }}>Sign in to manage your smart home</p>
        </div>
        <LoginForm />
        <p
          style={{
            textAlign: "center",
            marginTop: "1.5rem",
            color: "#444",
            fontSize: "0.875rem",
          }}
        >
          Demo: demo@home.com / Demo@123!
        </p>
      </div>
    </div>
  );
}

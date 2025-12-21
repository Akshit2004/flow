import Button from "@/components/ui/Button";
import Link from "next/link";

export default function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      gap: '2rem' 
    }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', letterSpacing: '-0.05em' }}>
        Project Flow
      </h1>
      <p style={{ color: 'var(--text-secondary)' }}>
        Manage your projects with ease and style.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link href="/signup">
          <Button variant="primary">Get Started</Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary">Sign In</Button>
        </Link>
      </div>
    </div>
  );
}

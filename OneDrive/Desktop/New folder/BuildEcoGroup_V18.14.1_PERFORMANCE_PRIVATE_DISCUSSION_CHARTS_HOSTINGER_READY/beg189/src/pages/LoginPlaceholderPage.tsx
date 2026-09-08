import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../lib/routes';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LogIn, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPlaceholderPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSimulatedLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate entry to dashboard placeholder in Phase 1
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <Card variant="default" className="p-8 space-y-6 shadow-md">
      
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-1.5 mx-auto">
          <Badge variant="neutral" size="sm">
            Phase 1 Auth Placeholder
          </Badge>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text)]">
          Client & Specialist Portal
        </h1>
        <p className="text-xs text-[var(--color-text-muted)]">
          Access your active case records, milestone signoffs, and BOQ files.
        </p>
      </div>

      <form onSubmit={handleSimulatedLogin} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-[var(--color-text-muted)]">
            <input type="checkbox" className="rounded text-[var(--color-primary)] focus:ring-[#1697C4]" />
            <span>Remember session</span>
          </label>
          <span className="text-[var(--color-primary)] hover:underline cursor-pointer">
            Forgot password?
          </span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In (Preview Workspace)
        </Button>
      </form>

      <div className="p-3 rounded-lg bg-[#EAF4F8] border border-[#C6DEE8] text-xs text-[#0C2939] space-y-1">
        <strong>Phase 1 Notice:</strong>
        <p>PostgreSQL user tables and secure Firebase/OAuth authentication will be wired in Phase 2. Clicking Sign In enters the Phase 1 dashboard layout preview.</p>
      </div>

      <div className="pt-2 text-center text-xs text-[var(--color-text-muted)]">
        <span>Need an account? </span>
        <Link to={ROUTES.REGISTER} className="font-bold text-[var(--color-primary)] hover:underline">
          Register New Project Profile
        </Link>
      </div>

    </Card>
  );
};

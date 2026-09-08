import React, { useEffect, useState } from 'react';
import { MessageSquare, Send, Loader2, FolderKanban, ShieldCheck } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { fetchAllCasesApi, fetchCaseMessagesApi, sendCaseMessageApi } from '../lib/api';
import { CaseRecord, CaseMessageRecord } from '../types/backend';

// Case-ID linked messaging, wired to the real /api/cases/:id/messages endpoints.
// Replaces the previous shared placeholder that showed static, non-functional
// sample data for every user.
export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CaseMessageRecord[]>([]);
  const [draft, setDraft] = useState('');
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoadingCases(true);
    fetchAllCasesApi()
      .then(res => {
        if (cancelled) return;
        setCases(res.cases || []);
        if (res.cases && res.cases.length > 0) {
          setSelectedCaseId(res.cases[0].id);
        }
      })
      .catch(err => {
        if (!cancelled) setError(err.message || 'Failed to load cases');
      })
      .finally(() => {
        if (!cancelled) setLoadingCases(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedCaseId) return;
    let cancelled = false;
    setLoadingMessages(true);
    setError(null);
    fetchCaseMessagesApi(selectedCaseId)
      .then(res => {
        if (!cancelled) setMessages(res.messages || []);
      })
      .catch(err => {
        if (!cancelled) setError(err.message || 'Failed to load messages');
      })
      .finally(() => {
        if (!cancelled) setLoadingMessages(false);
      });
    return () => { cancelled = true; };
  }, [selectedCaseId]);

  const handleSend = async () => {
    if (!selectedCaseId || !draft.trim()) return;
    setSending(true);
    setError(null);
    try {
      const res = await sendCaseMessageApi(selectedCaseId, draft.trim());
      setMessages(prev => [...prev, res.messageRecord]);
      setDraft('');
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const selectedCase = cases.find(c => c.id === selectedCaseId);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Case Messages</h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
          Secure, case-linked conversations with your assigned consultant, vendor, or operations desk.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-[#C9DDD5] bg-[#F1F7F3] p-4 text-xs text-[var(--color-text-muted)]">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]" aria-hidden />
        <div>
          <p className="font-extrabold text-[var(--color-text)]">Private discussion by Case ID</p>
          <p className="mt-1 leading-relaxed">Customer phone and email are hidden from the consultant. Keep project discussion, files and decisions inside this thread.</p>
        </div>
      </div>

      {loadingCases ? (
        <Card className="p-8 flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)]">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading your cases...
        </Card>
      ) : cases.length === 0 ? (
        <Card className="p-8 text-center space-y-2">
          <FolderKanban className="w-8 h-8 mx-auto text-[var(--color-text-muted)]" />
          <p className="text-sm font-semibold text-[var(--color-text)]">No cases yet</p>
          <p className="text-xs text-[var(--color-text-muted)]">Submit a requirement to start a case and message your assigned specialist.</p>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-[280px_1fr] gap-5">
          {/* Case list */}
          <Card className="p-3 space-y-1 h-fit">
            {cases.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCaseId(c.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors ${
                  c.id === selectedCaseId ? 'bg-[#EAF4F8] border border-[#1697C4]/40' : 'hover:bg-[var(--color-background)] border border-transparent'
                }`}
              >
                <div className="font-mono-code text-[var(--color-primary)] font-semibold">{c.caseReference}</div>
                <div className="text-[var(--color-text)] font-medium truncate">{c.projectTitle}</div>
              </button>
            ))}
          </Card>

          {/* Thread */}
          <Card className="p-5 flex flex-col gap-4 min-h-[420px]">
            {selectedCase && (
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <div>
                  <div className="text-sm font-bold text-[var(--color-text)]">{selectedCase.projectTitle}</div>
                  <div className="text-[11px] text-[var(--color-text-muted)] font-mono-code">{selectedCase.caseReference}</div>
                </div>
                <Badge variant="primary" size="sm">{selectedCase.pillar}</Badge>
              </div>
            )}

            <div className="flex-1 space-y-3 overflow-y-auto">
              {loadingMessages ? (
                <div className="flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)] py-8">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-xs text-[var(--color-text-muted)]">
                  <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  No messages yet on this case. Send the first one below.
                </div>
              ) : (
                messages.map(m => {
                  const isSelf = m.senderUserId === user?.id;
                  return (
                    <div key={m.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-xs ${
                        isSelf ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-background)] text-[var(--color-text)] border border-[var(--color-border)]'
                      }`}>
                        <div className={`text-[10px] font-semibold mb-1 ${isSelf ? 'text-white/80' : 'text-[var(--color-text-muted)]'}`}>
                          {m.senderName} · {m.senderRole}
                        </div>
                        <div>{m.message}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}

            <div className="flex gap-2 pt-2 border-t border-[var(--color-border)]">
              <input
                type="text"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !sending) handleSend(); }}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 rounded-lg border border-[var(--color-border)] text-xs focus:outline-none focus:ring-2 focus:ring-[#1697C4]/30"
                disabled={!selectedCaseId || sending}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleSend}
                disabled={!draft.trim() || sending}
                leftIcon={sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              >
                Send
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

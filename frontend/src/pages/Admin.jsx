import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { useContent } from "../hooks/useContent";
import { useToast } from "../hooks/use-toast";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";
const ADMIN_PASSWORD = "KOG2025"; // demo only; no real security

export default function Admin() {
  const { data, loading, error } = useContent();
  const { toast } = useToast();

  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState(localStorage.getItem("KOG_ADMIN_PASS") || "");

  const [form, setForm] = useState({
    contractAddress: "",
    dexUrl: "",
    telegram: "",
    twitter: "",
  });

  useEffect(() => {
    if (data) {
      setForm({
        contractAddress: data?.config?.contractAddress || "",
        dexUrl: data?.hero?.ctas?.dexUrl || "",
        telegram: data?.hero?.ctas?.telegram || "",
        twitter: data?.hero?.ctas?.twitter || "",
      });
    }
  }, [data]);

  useEffect(() => {
    if (pass && pass === ADMIN_PASSWORD) {
      setAuthed(true);
      localStorage.setItem("KOG_ADMIN_PASS", pass);
    }
  }, [pass]);

  const onSave = async () => {
    if (!authed) {
      toast({ title: "Unauthorized", description: "Enter correct password first", duration: 2500 });
      return;
    }
    try {
      const payload = {
        ...data,
        hero: {
          ...data.hero,
          ctas: {
            ...data.hero.ctas,
            dexUrl: form.dexUrl,
            telegram: form.telegram,
            twitter: form.twitter,
          },
        },
        config: {
          ...data.config,
          contractAddress: form.contractAddress,
        },
      };
      await axios.put(`${API}/content`, payload, { timeout: 20000 });
      toast({ title: "Saved", description: "Content updated successfully", duration: 2500 });
    } catch (e) {
      toast({ title: "Save failed", description: e?.message || "Unknown error", duration: 3000 });
    }
  };

  const Field = ({ id, label, placeholder, value, onChange }) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="body-small">{label}</Label>
      <Input id={id} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="bg-[#121212] text-white border border-[rgba(255,255,255,0.25)] rounded-none h-12" />
    </div>
  );

  return (
    <div className="dark-full-container">
      <div className="dark-content-container" style={{ paddingTop: 100, paddingBottom: 80 }}>
        <h1 className="display-large mb-2">Admin Update</h1>
        <p className="body-small text-white/70 mb-8">Password-gated demo panel to update contract address and CTA links. This is not production security.</p>

        <div className="glass-panel gold-border p-6 mb-8 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 items-center">
            <Label className="body-small">Password</Label>
            <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Enter admin password" className="bg-[#121212] text-white border border-[rgba(255,255,255,0.25)] rounded-none h-12" />
          </div>
          <p className="body-small text-white/60 mt-2">Default password: <span className="gold-text">{ADMIN_PASSWORD}</span> (demo only)</p>
        </div>

        <div className="glass-panel gold-border p-6 max-w-3xl">
          {loading && <div className="body-small">Loading content…</div>}
          {error && <div className="body-small text-red-400">{String(error)}</div>}
          {data && (
            <div className="space-y-5">
              <Field id="contract" label="Contract Address" placeholder="0x..." value={form.contractAddress} onChange={(v) => setForm({ ...form, contractAddress: v })} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field id="dex" label="DEX URL" placeholder="https://…" value={form.dexUrl} onChange={(v) => setForm({ ...form, dexUrl: v })} />
                <Field id="tg" label="Telegram URL" placeholder="https://t.me/…" value={form.telegram} onChange={(v) => setForm({ ...form, telegram: v })} />
                <Field id="tw" label="X/Twitter URL" placeholder="https://x.com/…" value={form.twitter} onChange={(v) => setForm({ ...form, twitter: v })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button className="btn-primary dark-button-animate" onClick={onSave}>Save Changes</button>
                <button className="btn-secondary dark-button-animate" onClick={() => window.location.assign("/")}>Back to Site</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
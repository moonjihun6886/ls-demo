import { useEffect, useState, useMemo } from "react";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";

export function useContent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchContent() {
      try {
        const res = await axios.get(`${API}/content`, { timeout: 15000 });
        if (!mounted) return;
        setData(res.data);
      } catch (e) {
        setError(e?.message || "Failed to load content");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchContent();
    return () => { mounted = false; };
  }, []);

  const contract = useMemo(() => data?.config?.contractAddress || "", [data]);
  const ctas = useMemo(() => data?.hero?.ctas || {}, [data]);

  return { data, loading, error, contract, ctas };
}
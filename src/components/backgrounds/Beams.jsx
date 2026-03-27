import { useState, useEffect } from 'react';
import './Beams.css';

export default function Beams(props) {
  const [Impl, setImpl] = useState(null);

  useEffect(() => {
    import('./BeamsImpl.jsx').then(m => setImpl(() => m.default));
  }, []);

  if (!Impl) return null;
  return <Impl {...props} />;
}

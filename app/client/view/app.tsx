import './app.css';
import { useApp } from '../model/app.tsx';

export default function App() {
  const app = useApp();
  console.log({ app });
  return (
    <div>hello world</div>
  );
}


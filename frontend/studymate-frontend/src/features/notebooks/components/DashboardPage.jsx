import Navbar from '../../../shared/components/Navbar';
import NotebookList from './NotebookList';

export default function DashboardPage() {
  return (
    <div className="page-layout">
      <Navbar />
      <main className="main-content">
        <NotebookList />
      </main>
    </div>
  );
}

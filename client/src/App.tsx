import { useEffect, useState } from 'react';
import ScheduleForm from './components/ScheduleForm';
import StatusMsg from './components/StatusMsg';

const App: React.FC = () => {
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | 'warning'; message: string } | null>(null);

  useEffect(() => {

    if (status !== null) {

      const timer = setTimeout(() => {
        setStatus(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
    
  }, [status]);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My App</h1>
      {status && <StatusMsg type={status.type} message={status.message} />}
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Schedule WhatsApp Message
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <ScheduleForm
              setStatus={setStatus}
            />
        </div>
      </div>
      </div>
      </div>
  );
};

export default App;
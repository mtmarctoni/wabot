import React, { useState } from 'react';

interface ScheduleFormData {
  recipient: string;
  message: string;
  scheduledTime: string;
}

interface Props {
    setStatus: (status: {
        type: 'success' | 'error' | 'info' | 'warning';
        message: string;
    }) => void;
}

const ScheduleForm = ({setStatus}: Props) => {
  const [formData, setFormData] = useState<ScheduleFormData>({
    recipient: '',
    message: '',
    scheduledTime: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
      setStatus({
          type: 'info',
          message: 'Scheduling...',
    });
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
          setStatus({
              type: 'success',
              message: 'Message scheduled successfully!',
        });
        setFormData({ recipient: '', message: '', scheduledTime: '' });
      } else {
          setStatus({
              type: 'error',
              message: 'Failed to schedule message. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error:', error);
        setStatus({
            type: 'error',
            message: 'Failed to schedule message. Please try again.',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">Recipient</label>
        <input
          type="text"
          id="recipient"
          name="recipient"
          value={formData.recipient}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        ></textarea>
      </div>
      <div>
        <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700">Scheduled Time</label>
        <input
          type="datetime-local"
          id="scheduledTime"
          name="scheduledTime"
          value={formData.scheduledTime}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          required
        />
      </div>
      <div>
        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Schedule Message
        </button>
      </div>
    </form>
  );
};

export default ScheduleForm;

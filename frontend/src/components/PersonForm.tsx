// PersonForm.tsx

import { Button } from "../App";

type PersonFormProps = {
  newName: string;
  setNewName: (value: string) => void;
  newNumber: string;
  setNewNumber: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const PersonForm = ({
  newName,
  setNewName,
  newNumber,
  setNewNumber,
  onSubmit,
}: PersonFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name
        </label>
        <input
          placeholder="Enter full name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <input
          placeholder="Enter phone number"
          value={newNumber}
          onChange={(e) => setNewNumber(e.target.value)}
          type="tel"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-500"
        />
      </div>
      
      <Button
        type="submit"
        text="Add Contact"
        variant="primary"
        size="lg"
      />
    </form>
  );
};
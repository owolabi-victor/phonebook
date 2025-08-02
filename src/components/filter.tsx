//filter.tsx
import type { Person } from "../App";
import { Button } from "../App";

type FilteredPersonsProps = {
  persons: Person[];
  search: string;
  onEdit: (id: number) => void;
  handleDelete: (id: number) => void;
};

export const FilteredPersons = ({ persons, search, onEdit, handleDelete }: FilteredPersonsProps) => {
  const filtered = persons.filter((person) => {
    if (!search) return true;
    return `${person.name} ${person.number}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  if (filtered.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-400 text-4xl mb-3">🔍</div>
        <p className="text-gray-500 text-sm">No contacts found</p>
        <p className="text-gray-400 text-xs mt-1">Try adjusting your search</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {filtered.map((p, index) => (
        <div
          key={p.id}
          className={`p-4 transition-all duration-200 hover:bg-gray-50 ${
            index === 0 ? 'rounded-t-xl' : ''
          } ${index === filtered.length - 1 ? 'rounded-b-xl' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">
                  {p.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{p.name}</p>
                <p className="text-sm text-gray-600">{p.number}</p>
              </div>
            </div>
            <div className="flex space-x-2 ml-4">
              <Button 
                text="Edit" 
                onClick={() => onEdit(p.id)} 
                variant="secondary" 
                // size="sm"
              />
              <Button 
                text="Delete" 
                onClick={() => handleDelete(p.id)} 
                variant="danger" 
                size="sm"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
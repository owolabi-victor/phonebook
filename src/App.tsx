// app.tsx
import React from "react";
import { useState, useEffect } from "react";
import { PersonForm } from "./components/PersonForm";
import { FilteredPersons } from "./components/filter";
import PhoneBookService from "./services/phoneBook";

type ButtonProps = {
  text: string;
  type?: "button" | "submit";
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
};

export type Person = {
  name: string;
  number: string;
  id: number;
};

export const Button = ({
  type = "button",
  text,
  onClick,
  variant = "primary",
  size = "md",
}: ButtonProps) => {
  const baseClasses =
    "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95";

  const variantClasses = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-sm focus:ring-blue-500",
    secondary:
      "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 focus:ring-gray-400",
    danger:
      "bg-red-500 hover:bg-red-600 text-white shadow-sm focus:ring-red-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {text}
    </button>
  );
};

const App = () => {
  const [persons, setPersons] = useState<Person[]>([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState<string>("");
  const [search, setSearch] = useState("");
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  useEffect(() => {
    PhoneBookService.getAll().then((initialPersons) => {
      setPersons(initialPersons);
    });
  }, []);

  const addNewObjects = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = newName.trim();
    const parsedNumber = parseInt(newNumber);

    // ❌ name must not contain numbers
    if (/\d/.test(trimmedName)) {
      alert("Name cannot contain numbers");
      return;
    }

    // ❌ number must be digits only
    if (!/^\d+$/.test(newNumber)) {
      alert("Number must contain only digits");
      return;
    }

    if (isNaN(parsedNumber) || trimmedName === "") return;

    const exists = persons.some(
      (p) =>
        p.name.toLowerCase() === trimmedName.toLocaleLowerCase() &&
        p.number === parsedNumber.toString()
    );

    if (exists) {
      alert(`${trimmedName} ${parsedNumber} is already added to phonebook`);
      return;
    }

    const existingPerson = persons.find(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existingPerson) {
      const confirmReplace = window.confirm(
        `${trimmedName} is already in the phonebook. Replace the old number with the new one?`
      );

      if (confirmReplace) {
        const updatedEntry = {
          ...existingPerson,
          number: parsedNumber.toString(),
        };

        PhoneBookService.update(existingPerson.id, updatedEntry)
          .then((returnedPerson) => {
            setPersons((prev) =>
              prev.map((p) => (p.id === existingPerson.id ? returnedPerson : p))
            );
            setNewName("");
            setNewNumber("");
          })
          .catch((error) => {
            console.error("Error updating person:", error);
          });
      }
      return;
    }

    const newEntry = {
      name: newName,
      number: newNumber,
    };

    PhoneBookService.create(newEntry)
      .then((returnedPerson) => {
        setPersons((prev) => [...prev, returnedPerson]);
        setNewName("");
        setNewNumber("");
        showNotification(`${returnedPerson.name} was added to the phonebook`);
      })
      .catch((error) => {
        console.error("Error creating entry:", error);
      });
  };

  const handleUpdate = (id: number, updatedEntry: Person) => {
    PhoneBookService.update(id, updatedEntry)
      .then((returnedPerson) => {
        setPersons((prev) =>
          prev.map((p) => (p.id === id ? returnedPerson : p))
        );
      })
      .catch((error) => {
        console.error("Error updating person:", error);
      });
  };

  const handleDelete = (id: number) => {
    console.log("Deleting ID:", id, "Type:", typeof id);
    const person = persons.find((p) => p.id === id);
    console.log("Found person:", person);
    const confirm = window.confirm(`Delete ${person?.name}?`);

    if (confirm && person) {
      PhoneBookService.remove(id)
        .then(() => {
          setPersons((prev) => prev.filter((p) => p.id !== id));
          showNotification(`${person.name} was deleted from the phonebook`);
        })
        .catch((error) => {
          console.error("Error deleting person:", error);
        });
    }
  };

  const handleUpdatePrompt = (id: number) => {
    const person = persons.find((p) => p.id === id);
    if (!person) return;

    const newNumber = prompt(
      `Update number for ${person.name}:`,
      person.number
    );

    if (!newNumber || newNumber.trim() === "") return;

    if (newNumber === person.number) {
      alert("That number is already the current number.");
      return;
    }

    const duplicate = persons.find(
      (p) => p.number === newNumber && p.id !== id
    );

    if (duplicate) {
      alert(`Number ${newNumber} is already used by ${duplicate.name}.`);
      return;
    }

    const confirm = window.confirm(
      `Are you sure you want to update ${person.name}'s number from ${person.number} to ${newNumber}?`
    );

    if (confirm) {
      const updated = { ...person, number: newNumber };
      handleUpdate(id, updated);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Mobile Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-6 sm:px-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-semibold">📱</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Phonebook</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 sm:px-6 max-w-md mx-auto space-y-6">
        {/* Notification */}
        {notification && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl shadow-sm animate-pulse">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span className="text-sm font-medium">{notification}</span>
            </div>
          </div>
        )}

        {/* Search Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-gray-500">🔍</span>
            <h2 className="text-lg font-semibold text-gray-900">
              Search Contacts
            </h2>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-900 placeholder-gray-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Add Contact Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-4">
            <span className="text-gray-500">➕</span>
            <h2 className="text-lg font-semibold text-gray-900">
              Add New Contact
            </h2>
          </div>
          <PersonForm
            newName={newName}
            setNewName={setNewName}
            newNumber={newNumber}
            setNewNumber={setNewNumber}
            onSubmit={addNewObjects}
          />
        </div>

        {/* Contacts List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-gray-500">👥</span>
                <h2 className="text-lg font-semibold text-gray-900">
                  Contacts
                </h2>
              </div>
              <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                {
                  persons.filter((person) => {
                    if (!search) return true;
                    return `${person.name} ${person.number}`
                      .toLowerCase()
                      .includes(search.toLowerCase());
                  }).length
                }
              </span>
            </div>
          </div>
          <FilteredPersons
            persons={persons}
            search={search}
            onEdit={handleUpdatePrompt}
            handleDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default App;

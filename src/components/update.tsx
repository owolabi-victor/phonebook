import type { Person } from "../App";
import  {Button}  from "../App";
import PhoneBookService from '../services/phoneBook'


type UpdateProps = {
    persons: Person[];
    id: number;
}

const handleUpdate = (id: number, updatedEntry: Person) => {
  PhoneBookService.update(id, updatedEntry)
    .then((returnedPerson) => {
      setPersons((prev) =>
        prev.map((p) => (p.id === id ? returnedPerson : p))
      );
    })
    .catch((error) => {
      console.error('Error updating person:', error);
    });
};


const handleUpdatePrompt = ({persons, id}: UpdateProps) => {
  const person = persons.find((p) => p.id === id);
  const newNumber = prompt(`Update number for ${person?.name}:`, person?.number);

  if (newNumber && person) {
    const updated = { ...person, number: newNumber };
    handleUpdate(id, updated);
  }
};

// mongo.js
import mongoose from 'mongoose';

const { set, connect, Schema, model, connection } = mongoose;

// Usage info
if (process.argv.length < 3) {
  console.log('Usage: node mongo.js <password> [<name> <number>]');
  process.exit(1);
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://vicowolabi22:${password}@fullstack.mnah0zl.mongodb.net/phonebook?retryWrites=true&w=majority&appName=fullstack`;

set('strictQuery', false);

connect(url);

const personSchema = new Schema({
  name: String,
  number: String,
});

const Person = model('Person', personSchema);

if (process.argv.length === 3) {
  // No name/number provided — list all contacts
  Person.find({})
    .then(result => {
      console.log('Phonebook:');
      result.forEach(person => {
        console.log(`${person.name} ${person.number}`);
      });
      connection.close();
    })
    .catch(err => {
      console.error(err);
      connection.close();
    });
} else if (process.argv.length === 5) {
  // Add a new contact
  const person = new Person({
    name: name,
    number: number,
  });

  person.save()
    .then(() => {
      console.log(`Added ${name} number ${number} to phonebook`);
      connection.close();
    })
    .catch(err => {
      console.error(err);
      connection.close();
    });
} else {
  console.log('Please provide both name and number or just password to list entries.');
  connection.close();
}











// import mongoose from 'mongoose';

// const { set, connect, Schema, model, connection } = mongoose;

// // Check that at least password and content are provided
// if (process.argv.length < 4) {
//   console.log('Usage: node mongo.js <password> <note content> [important]');
//   process.exit(1);
// }

// const password = process.argv[2];
// const content = process.argv[3];
// const important = process.argv[4] === 'true'; // optional, defaults to false if not passed

// const url = `mongodb+srv://vicowolabi22:${password}@fullstack.mnah0zl.mongodb.net/noteApp?retryWrites=true&w=majority&appName=fullstack`;

// set('strictQuery', false);

// connect(url);

// const noteSchema = new Schema({
//   content: String,
//   important: Boolean,
// });

// const Note = model('Note', noteSchema);

// const note = new Note({
//   content: content,
//   important: important || false,
// });

// // note.save().then(() => {
// //   console.log(`Note saved! Content: "${content}"`);
// //   connection.close();
// // });

// note.save()
//   .then(() => {
//     console.log('Note saved!');
//     // fetch and print all notes
//     return Note.find({});
//   })
//   .then(result => {
//     console.log('All notes in DB:');
//     result.forEach(note => {
//       console.log(note);
//     });
//     connection.close();
//   })
//   .catch(err => {
//     console.error(err);
//     connection.close();
//   });











// import mongoose from 'mongoose';

// const { set, connect, Schema, model, connection } = mongoose;

// if (process.argv.length < 3) {
//   console.log('give password as argument')
//   process.exit(1)
// }

// const password = process.argv[2]

// const url = `mongodb+srv://vicowolabi22:${password}@fullstack.mnah0zl.mongodb.net/noteApp?retryWrites=true&w=majority&appName=fullstack`

// set('strictQuery',false)

// connect(url)

// const noteSchema = new Schema({
//   content: String,
//   important: Boolean,
// })

// const Note = model('Note', noteSchema)

// const note = new Note({
//   content: 'HTML is easy',
//   important: true,
// })

// note.save().then(result => {
//   console.log('note saved!')
//   connection.close()
// })
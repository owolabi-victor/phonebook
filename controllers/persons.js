// controllers/persons.js
import express from 'express'
import Person from '../models/person.js'
import User from '../models/user.js'
import auth from '../utils/auth.js'

// CSV & Email
import { createObjectCsvStringifier } from 'csv-writer'
import nodemailer from 'nodemailer'
import fileUpload from 'express-fileupload'
import csvParser from 'csv-parser'
import fs from 'fs'
import path from 'path'

const personsRouter = express.Router()

// ALL ROUTES REQUIRE AUTH
personsRouter.use(auth)

/**
 * GET ALL (Paginated)
 */
personsRouter.get('/', async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    const total = await Person.countDocuments({ user: req.user.id })
    const persons = await Person.find({ user: req.user.id })
      .skip(skip)
      .limit(limit)

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: persons
    })
  } catch (error) {
    next(error)
  }
})

/**
 * EXPORT: DOWNLOAD CSV
 * MOVED BEFORE /:id route to prevent "export" being treated as an ID
 */
personsRouter.get('/export', async (req, res) => {
  try {
    const userId = req.user.id
    if (!userId) return res.status(401).json({ error: 'Unauthorized' })

    const user = await User.findById(userId).populate('persons')
    if (!user) return res.status(404).json({ error: 'User not found' })

    const persons = user.persons || []

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'name', title: 'Name' },
        { id: 'number', title: 'Phone Number' },
        { id: 'createdAt', title: 'Added On' }
      ]
    })

    const csv = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(persons)

    res.header('Content-Type', 'text/csv')
    res.attachment(`contacts_${user.username}.csv`)
    res.send(csv)
  } catch (error) {
    console.error('Export error:', error)
    res.status(500).json({ error: 'Export failed' })
  }
})

/**
 * EXPORT: EMAIL CSV
 */
personsRouter.post('/export/email', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email required' })

  try {
    const user = await User.findById(req.user.id).populate('persons')
    if (!user) return res.status(404).json({ error: 'User not found' })

    const persons = user.persons || []

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'name', title: 'Name' },
        { id: 'number', title: 'Phone Number' }
      ]
    })

    const csv = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(persons)

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    })

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Your Phonebook Contacts - ${user.username}`,
      text: `Hi ${user.username},\n\nYour contacts are attached as CSV.\n\n— Phonebook App`,
      attachments: [{ filename: `contacts_${user.username}.csv`, content: csv }]
    })

    res.json({ message: 'Email sent!' })
  } catch (error) {
    console.error('Email error:', error)
    res.status(500).json({ error: 'Email failed' })
  }
})

/**
 * IMPORT: UPLOAD CSV
 */
personsRouter.post('/import', fileUpload(), async (req, res) => {
  if (!req.files || !req.files.csv) {
    return res.status(400).json({ error: 'CSV file required' })
  }

  const file = req.files.csv
  const filePath = path.join('/tmp', `upload_${Date.now()}.csv`)
  await file.mv(filePath)

  const results = []

  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (row) => {
      if (row.name && row.number) results.push(row)
    })
    .on('end', async () => {
      try {
        const user = await User.findById(req.user.id)
        const newPersons = []

        for (const { name, number } of results) {
          const person = new Person({ name, number, user: user._id })
          await person.save()
          newPersons.push(person._id)
        }

        await User.findByIdAndUpdate(user._id, {
          $push: { persons: { $each: newPersons } }
        })

        fs.unlinkSync(filePath)
        res.json({ message: `Imported ${newPersons.length} contacts` })
      } catch (error) {
        console.error('Import error:', error)
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
        res.status(500).json({ error: 'Import failed' })
      }
    })
})

/**
 * GET ONE
 * MOVED AFTER specific routes to avoid catching them as IDs
 */
personsRouter.get('/:id', async (req, res, next) => {
  try {
    const person = await Person.findOne({ _id: req.params.id, user: req.user.id })
    if (!person) return res.status(404).json({ error: 'Contact not found' })
    res.json(person)
  } catch (error) {
    next(error)
  }
})

/**
 * CREATE
 */
personsRouter.post('/', async (req, res, next) => {
  try {
    const { name, number } = req.body
    if (!name || !number) return res.status(400).json({ error: 'name or number missing' })

    const person = new Person({ name, number, user: req.user.id })
    const savedPerson = await person.save()

    await User.findByIdAndUpdate(req.user.id, { $push: { persons: savedPerson._id } })
    res.status(201).json(savedPerson)
  } catch (error) {
    next(error)
  }
})

/**
 * UPDATE
 */
personsRouter.put('/:id', async (req, res, next) => {
  try {
    const { name, number } = req.body
    const updatedPerson = await Person.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name, number },
      { new: true, runValidators: true, context: 'query' }
    )

    if (!updatedPerson) return res.status(404).json({ error: 'Contact not found' })
    res.json(updatedPerson)
  } catch (error) {
    next(error)
  }
})

/**
 * DELETE
 */
personsRouter.delete('/:id', async (req, res, next) => {
  try {
    const deletedPerson = await Person.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    })

    if (!deletedPerson) return res.status(404).json({ error: 'Contact not found' })

    await User.findByIdAndUpdate(req.user.id, { $pull: { persons: req.params.id } })
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

export default personsRouter
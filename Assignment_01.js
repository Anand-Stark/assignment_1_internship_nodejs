const fs = require('fs');
const csv = require('csv-parser');

// Step 1: Read the CSV file and extract the data
const books = [];
const magazines = [];
const authors = {};

fs.createReadStream('books-magazines-authors.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Extract the data for books, magazines, and authors
    if (row.Type === 'book') {
      books.push({
        title: row.Title,
        authorId: row.AuthorId,
        isbn: row.ISBN,
        publicationDate: row.PublicationDate
      });
    } else if (row.Type === 'magazine') {
      magazines.push({
        title: row.Title,
        issue: row.Issue,
        publicationDate: row.PublicationDate
      });
    }

    if (!(row.AuthorId in authors)) {
      authors[row.AuthorId] = {
        name: row.AuthorName,
        email: row.AuthorEmail
      };
    }
  })
  .on('end', () => {
    // Step 2: Print out all books and magazines
    console.log('Books:');
    books.forEach((book) => {
      console.log(`Title: ${book.title}, Author: ${authors[book.authorId].name}, ISBN: ${book.isbn}, Publication Date: ${book.publicationDate}`);
    });

    console.log('\nMagazines:');
    magazines.forEach((magazine) => {
      console.log(`Title: ${magazine.title}, Issue: ${magazine.issue}, Publication Date: ${magazine.publicationDate}`);
    });

    // Step 3: Find a book or magazine by its ISBN
    const isbnToFind = '978-0525537443'; // replace with user input
    const foundBook = books.find((book) => book.isbn === isbnToFind);
    const foundMagazine = magazines.find((magazine) => magazine.isbn === isbnToFind);

    console.log(`\nFound book: ${foundBook ? foundBook.title : 'Not found'}`);
    console.log(`Found magazine: ${foundMagazine ? foundMagazine.title : 'Not found'}`);

    // Step 4: Find all books and magazines by their authors' email
    const emailToFind = 'jane.doe@example.com'; // replace with user input
    const authorId = Object.keys(authors).find((id) => authors[id].email === emailToFind);

    if (authorId) {
      const booksByAuthor = books.filter((book) => book.authorId === authorId);
      const magazinesByAuthor = magazines.filter((magazine) => magazine.authorId === authorId);

      console.log(`\nBooks by author with email ${emailToFind}:`);
      booksByAuthor.forEach((book) => {
        console.log(`Title: ${book.title}, ISBN: ${book.isbn}, Publication Date: ${book.publicationDate}`);
      });

      console.log(`\nMagazines by author with email ${emailToFind}:`);
      magazinesByAuthor.forEach((magazine) => {
        console.log(`Title: ${magazine.title}, Issue: ${magazine.issue}, Publication Date: ${magazine.publicationDate}`);
      });
    } else {
      console.log(`\nAuthor with email ${emailToFind} not found.`);
    }

    // Step 5: Print out all books and magazines sorted by title
    const allItems = [...books, ...magazines];
    allItems.sort((a, b) => a.title.localeCompare(b.title));

        // Step 5 (continued)
    console.log('\nAll items sorted by title:');
    allItems.forEach((item) => {
      if ('isbn' in item) {
        console.log(`Title: ${item.title}, Author: ${authors[item.authorId].name}, ISBN: ${item.isbn}, Publication Date: ${item.publicationDate}`);
      } else {
        console.log(`Title: ${item.title}, Issue: ${item.issue}, Publication Date: ${item.publicationDate}`);
      }
    });

    // Step 6: Add a book and a magazine to the data structure and export it to a new CSV file
    const newBook = {
      title: 'New Book',
      authorId: '3',
      isbn: '123-456-7890',
      publicationDate: '2023-01-01'
    };

    const newMagazine = {
      title: 'New Magazine',
      issue: 'January 2023',
      publicationDate: '2023-01-15'
    };

    books.push(newBook);
    magazines.push(newMagazine);

    const newData = [...books, ...magazines].map((item) => {
      if ('isbn' in item) {
        return {
          Type: 'book',
          Title: item.title,
          AuthorId: item.authorId,
          ISBN: item.isbn,
          PublicationDate: item.publicationDate
        };
      } else {
        return {
          Type: 'magazine',
          Title: item.title,
          Issue: item.issue,
          PublicationDate: item.publicationDate
        };
      }
    });

    const csvWriter = require('csv-writer').createObjectCsvWriter({
      path: 'new-data.csv',
      header: [
        { id: 'Type', title: 'Type' },
        { id: 'Title', title: 'Title' },
        { id: 'AuthorId', title: 'AuthorId' },
        { id: 'ISBN', title: 'ISBN' },
        { id: 'PublicationDate', title: 'PublicationDate' },
        { id: 'Issue', title: 'Issue' }
      ]
    });

    csvWriter.writeRecords(newData)
      .then(() => {
        console.log('\nNew data written to file.');
      });
  });

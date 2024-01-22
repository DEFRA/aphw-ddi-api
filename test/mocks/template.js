const template = {
  definition: [
    {
      type: 'page'
    },
    {
      type: 'text',
      font: 'Arial.bold',
      size: 10,
      text: 'Test'
    },
    {
      type: 'text',
      font: 'Arial.normal',
      size: 10,
      key: 'ownerName',
      x: 30,
      y: 30
    },
    {
      type: 'list',
      font: 'Arial.normal',
      size: 10,
      items: [
        'Test 1',
        'Test 2'
      ],
      options: {
        listType: 'numbered',
        paragraphGap: 10
      }
    }
  ],
  logo: Buffer.from('test image'),
  signature: Buffer.from('test image')
}

module.exports = template

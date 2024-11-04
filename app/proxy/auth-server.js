const config = require('../config')
const wreck = require('@hapi/wreck')
const endpoint = `${config.authServerUrl}/userinfo`

const addBearerHeader = (token) => {
  return {
    Authorization: `Bearer ${token}`
  }
}

const getUserInfo = async (token) => {
  const users = {
    OHg3RAGWwpJlTMutiQUjLs4cFpEvLMezBX034VMayYOOYmZ9iDrfKm7XrbTM45ps: 'perftest478@defratest.org.uk',
    a853001b4ff558ffff08576584a9bb37d5f6c9c96ee3244e7880e9fb9d0d34009d3dfa60b9658a5956a7dcc38157b19f1ec5c1c3d6f8dccd03f4604c20a46862: 'perftest478@defratest.org.uk',
    hP8CrPATbpmwKy0li4K6sd5OszwKATz3qXaYl3RTGbGLYhhyxRpaEvgRfOAURxef: 'perftest479@defratest.org.uk',
    '37afc3259e7caa88cefd38a471130d5b13f860aa310bfecafd7c39e969fce0b98219ef5f1bc0e9096cccf7aa7f0e5ff697f99a4c0997c18971a093f7ca61dee3': 'perftest479@defratest.org.uk',
    WO8tdcuqclO3lKPpucvxAGMmjTAopAeeFlHGwgETFT0d7kV4fdkIJXImDSaBRyU5: 'perftest480@defratest.org.uk',
    '77126cb1efefcd977f75c6d4e462aeb7327219d192e8eee93b8fb6cfaae02ffd440c332b01209a7123a3ae455325e7d0fbf5a0238d323cb4332e091a0ab7fb72': 'perftest480@defratest.org.uk',
    qf6RlCa2ES4HWmw8iLvCqz1FzH9GRWAAeB202ppytUuRjlYlHir00kcBIyZEj9J0: 'perftest481@defratest.org.uk',
    '76f777afeba3960e9026aaadf5f3694c8daa3c3492f3652ac5704132cf157a807cc9339151c73e22417fd7c14adc966cd74910ede810a30828ab4190e91c417b': 'perftest481@defratest.org.uk',
    EP7FmxeaCDZWUkC4xghaG9vlHcY06MJCuacJC6s51xUFtzXo5ULxB3UTlse9SQTB: 'perftest482@defratest.org.uk',
    fc2fa2d2cbb8efb53f3fb171490d44f49787945f5849d7ecb6037b7dd36544b861834060374dec6f39c30a5a52c4d6fe42868a7684bb437b74f86fe1e835a8b2: 'perftest482@defratest.org.uk'
  }

  if (users[token]) {
    return {
      email: users[token],
      email_verified: true
    }
  }

  const options = { json: true, headers: addBearerHeader(token) }
  const { payload } = await wreck.get(endpoint, options)

  return payload
}

module.exports = {
  getUserInfo
}

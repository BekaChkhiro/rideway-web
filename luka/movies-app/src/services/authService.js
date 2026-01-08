const signUp = async (user) => {
  try {
    const url = "https://academyofdigitalindustriesbackend.onrender.com/api/v1/auth/register";
    const resp = await fetch(url, {
      method: "POST",
      body: JSON.stringify(user),
      headers: {
        "Content-Type": "application/json",
      },
    });
    
    const data = await resp.json();
    
    if (!resp.ok) {
      throw new Error(data.msg || 'Registration failed');
    }
    
    return data;
  } catch (error) {
    if (error.message.includes('duplicate key error') && error.message.includes('userName')) {
      throw new Error('This username is already taken. Please choose a different one.');
    }
    throw new Error(error.message || 'Registration failed. Please try again.');
  }
};

const signIn = async (user) => {
  try {
    const url = "https://academyofdigitalindustriesbackend.onrender.com/api/v1/auth/login";
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    
    const data = await resp.json();
    
    if (!resp.ok) {
      throw new Error(data.msg || 'Invalid credentials');
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || 'Login failed. Please try again.');
  }
};

export { signIn, signUp };
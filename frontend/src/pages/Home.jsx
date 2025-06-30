// frontend/src/pages/Home.jsx
import React from 'react';
import Dashboard from '../components/Dashboard';

const Home = ({ user }) => {
  return <Dashboard user={user} />;
};

export default Home;
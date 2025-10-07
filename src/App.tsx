//App.tsx
import { Link, NavLink, Route, Routes } from "react-router-dom";
import ListView from "./pages/ListView";
import GalleryView from "./pages/GalleryView";
import DetailView from "./pages/DetailView";
import styles from "./styles/App.module.css";


export default function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>AIC Explorer</Link>
        <nav className={styles.nav}>
          <NavLink to="/list" className={({isActive}) => isActive ? styles.active : ""}>Search</NavLink>
          <NavLink to="/gallery" className={({isActive}) => isActive ? styles.active : ""}>Gallery</NavLink>
        </nav>
      </header>

      <main className={styles.main}>
        <Routes>
          <Route path="/" element={<ListView />} />
          <Route path="/list" element={<ListView />} />
          <Route path="/gallery" element={<GalleryView />} />
          {/* Detail has its own route */}
          <Route path="/art/:id" element={<DetailView />} />
          <Route path="*" element={<h2>Not Found</h2>} />
        </Routes>
      </main>

      <footer className={styles.footer}>
        <small>
          Data from the Art Institute of Chicago API • Built with React, TS, Axios, Router
        </small>
      </footer>
    </div>
  );
}

// import React from 'react';
// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.tsx</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

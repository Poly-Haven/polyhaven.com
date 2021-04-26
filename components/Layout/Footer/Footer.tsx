import { randomArraySelection } from 'utils/arrayUtils'

import styles from './Footer.module.scss';

const footer = () => {
  const example_names = [
    "Joni Mercado",
    "S J Bennett",
    "Adam Nordgren",
    "RENDER WORX",
    "Pierre Beranger",
    "Pablo Lopez Soriano",
    "Frank Busch",
    "Sterling Roth",
    "Jonathan Sargent",
    "hector gil",
    "Philip bazel",
    "Llynara",
    "BlenderBrit",
    "william norberg",
    "Michael Szalapski",
  ]
  let names_list = [];
  for (let i = 0; i < 1040; i++) {
    names_list[i] = example_names[Math.floor(Math.random() * example_names.length)];
  }
  const pledge_rank_weights = [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 5];


  // TODO Patreon connection
  return (
    <div id={styles.footer}>
      <h2>Patrons</h2>
      <div className={styles.patrons}>
        {names_list.map((n, i) => <p key={i} className={styles[`patron-rank-${randomArraySelection(pledge_rank_weights)}`]}>{n}</p>)}
      </div>
    </div>
  );
}

export default footer;
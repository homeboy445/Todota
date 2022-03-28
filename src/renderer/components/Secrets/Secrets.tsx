import { v4 as uuid } from 'uuid';
import './Secrets.css';

type Secret = { key: string };

const Secrets = () => {
  return (
    <div className="secrets">
      <div className="secrets-header">
        <h1>Keeper</h1>
        <input type="text" placeholder="Search key-wise." />
      </div>
      <div className="secrets-catalogue">
        {Object.keys({
          'Github-password': 'aicns',
          'COD-password': 'skmcsc',
          'VideoGame-username': 'skmcsc',
          'something-random': 'skmcskcm',
        }).map((item) => {
          return (
            <div className="secret-card" key={uuid()}>
              <h2>{item}</h2>
              <div className="secret-card-btns">
                <button type="button">Copy</button>
                <button type="button">Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Secrets;

/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState, useEffect, useContext } from 'react';
import { v4 as uuid } from 'uuid';
import Crypto from 'crypto-js';
import Main from 'renderer/context/main';
import axios from 'axios';
import SecretIcon from '../../assets/secret.jpg';
import './Secrets.css';

type Secret = { key: string; sid: string; value: string };

const Secrets = () => {
  const SecretPasswordKey =
    'XWUPfryHz5rDCEj6o+Jxl245E5MSL2TuHBe HONDcMUr2vEhhmcN7PO17RaMPJ6aMGdwaW9SxDkLZXwdtMUtOe+SmTIkd2aVmnRYN9jeV0KrIqXi0Vno91zdcTYjyPX7rEN/eg==';
  const context = useContext(Main);
  const [originalList, updateOrgList] = useState<
    Array<Secret | Record<string, string>>
  >([{}]);
  const [secrets, updateSecrets] = useState<
    Array<Secret | Record<string, string>>
  >([{}]);
  const [fetchedData, updateFetchState] = useState<boolean>(false);
  const [text, updateText] = useState<string>('');
  const [password, updatePassword] = useState<string>('');
  const [editMode, toggleEditMode] = useState<boolean>(false);
  const [searchQuery, updateSearchQuery] = useState<string>('');
  const [prevSearchQuery, updatePrevSearchQuery] = useState<string>('');
  const [counter, updateCounter] = useState<number>(0);

  const highlightSearchedResults = (element: string) => {
    const idx = element.lastIndexOf(searchQuery);
    if (idx === -1) return <h2 key={uuid()}>{element}</h2>;
    const len = searchQuery.length;
    return (
      <h2 key={uuid()} id="note-text">
        {element.substring(0, idx)}
        <span style={{ display: 'inline', background: 'yellow' }}>
          {searchQuery}
        </span>
        {element.substring(idx + len, element.length)}
      </h2>
    );
  };

  const processPassword = (
    value: string,
    type: 'encrypt' | 'decrypt'
  ): string => {
    let resultantString: string;
    switch (type) {
      case 'encrypt': {
        resultantString = Crypto.AES.encrypt(
          value,
          SecretPasswordKey
        ).toString();
        break;
      }
      case 'decrypt': {
        const bytes = Crypto.AES.decrypt(value, SecretPasswordKey);
        resultantString = bytes.toString(Crypto.enc.Utf8);
        break;
      }
      default: {
        resultantString = '';
      }
    }
    return resultantString;
  };

  const clearInput = () => {
    updateText('');
    updatePassword('');
  };

  useEffect(() => {
    if (!fetchedData) {
      axios
        .get(`${context.URI}/Secrets/`, context.getAuthHeaders())
        .then((response) => {
          updateOrgList(response.data);
          return updateSecrets(response.data);
        })
        .catch((err) => {
          context.RefreshAccessToken(err);
        });
      updateFetchState(true);
    }
    if (searchQuery.trim()) {
      if (searchQuery === prevSearchQuery) return;
      const searchedSecrets: Array<Secret> = [];
      for (let idx = 0; idx < originalList.length; idx += 1) {
        if (originalList[idx].key.includes(searchQuery)) {
          searchedSecrets.push(originalList[idx] as Secret);
        }
      }
      updateSecrets(searchedSecrets);
      updatePrevSearchQuery(searchQuery);
    } else if (originalList.length > secrets.length) {
      updateSecrets(originalList);
    }
  }, [context, secrets, editMode, counter, searchQuery]);

  return (
    <div className="secrets">
      <div className="secrets-header">
        <h1>Keeper</h1>
        <input
          type="text"
          placeholder="Search key-wise."
          onChange={(e) => updateSearchQuery(e.target.value)}
        />
      </div>
      {editMode ? (
        <div className="secrets-edit">
          <input
            type="text"
            value={text}
            onChange={(e) => {
              updateText(e.target.value);
            }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => {
              updatePassword(e.target.value);
            }}
          />
          <button
            type="submit"
            onClick={() => {
              if (!(text.trim() || password.trim())) {
                return;
              }
              const encryptedString = processPassword(password, 'encrypt');
              axios
                .post(
                  `${context.URI}/Secrets/add`,
                  {
                    key: text.trim(),
                    value: encryptedString,
                  },
                  context.getAuthHeaders()
                )
                .then((response) => {
                  if (response.data.status === 'ok') {
                    // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle
                    const secrets_: Record<any, any> = {};
                    secrets_.key = text;
                    secrets_.value = encryptedString;
                    const secretsArray = secrets;
                    secretsArray.push(secrets_);
                    updateSecrets(secretsArray);
                    clearInput();
                    return toggleEditMode(false);
                  }
                  return new Error(response as any);
                })
                .catch((err) => {
                  context.RefreshAccessToken(err);
                });
            }}
          >
            Done
          </button>
        </div>
      ) : null}
      {secrets.length < 1 && !editMode ? (
        <div
          className="secret-info"
          onDoubleClick={() => {
            toggleEditMode(true);
          }}
        >
          <h2>Keep your secrets super-safe!</h2>
          <img src={SecretIcon} alt="secretsImage" />
        </div>
      ) : (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          className="secrets-catalogue"
          onClick={() => {
            toggleEditMode(false);
          }}
        >
          {secrets.map((item) => {
            return (
              <div className="secret-card" key={item.sid || uuid()}>
                {highlightSearchedResults(item.key || '')}
                <div className="secret-card-btns">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        processPassword(item.value, 'decrypt')
                      );
                    }}
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      axios
                        .delete(
                          `${context.URI}/Secrets/remove/${item.sid}`,
                          context.getAuthHeaders()
                        )
                        .then((response) => {
                          if (response.data === 'Done!') {
                            const ss = secrets;
                            const idx = ss.findIndex((i) => i.sid === item.sid);
                            if (!Number.isNaN(idx)) {
                              ss.splice(idx, 1);
                              updateSecrets(ss);
                              updateCounter((counter + 1) % 2);
                            }
                          }
                          return new Error(response as any);
                        })
                        .catch((err) => {
                          context.RefreshAccessToken(err);
                        });
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <button
        className="secrets-floater-btn"
        type="button"
        style={{
          transform: editMode ? 'rotate(45deg)' : 'rotate(0deg)',
        }}
        onClick={() => {
          clearInput();
          toggleEditMode(!editMode);
        }}
      >
        +
      </button>
    </div>
  );
};

export default Secrets;

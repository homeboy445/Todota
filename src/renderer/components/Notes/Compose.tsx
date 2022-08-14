/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import axios from 'axios';
import { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Main from 'renderer/context/main';
import TagFilter from '../Util/TagFilter';
import './Notes.css';

const Compose = ({ type }: Record<string, any>) => {
  const { typeFromParam } = useParams();
  const context = useContext(Main);
  const operationType = useRef();

  const [Note, changeNote] = useState<{
    description: string;
    tags: Array<string>;
    date: string;
  }>({
    description: '',
    tags: [],
    date: '',
  });
  const [ViewFilterMenu, toggleFilterMenu] = useState<boolean>(false);
  const [counter, updateCounter] = useState<number>(0);

  const UpdateFilterSettings = (element: { tags: Array<string> }): void => {
    changeNote({ ...Note, ...element });
    updateCounter((counter + 1) % 2);
  };

  const deleteNote = (nId: string): void => {
    if (!nId.trim()) return;
    // eslint-disable-next-line promise/catch-or-return
    axios
      .delete(`${context.URI}/Notes/remove/${nId}`, context.getAuthHeaders())
      .then(() =>
        (window as any).electron.ipcRenderer.send('notes:reload', true)
      )
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    (window as any).electron.ipcRenderer.on(
      'notes:compose.add',
      (data: Record<string, any>) => {
        sessionStorage.setItem('AccessToken', data?.Auth?.AccessToken || '');
      }
    );
    (window as any).electron.ipcRenderer.on(
      'notes:compose.edit',
      (data: Record<string, any>) => {
        changeNote({ ...Note, ...data.note }); // This way even if some property of `Note` is missing, it would be taken care of!
        sessionStorage.setItem('AccessToken', data?.Auth?.AccessToken || '');
        operationType.current = data.type;
      }
    );
    (window as any).electron.ipcRenderer.on(
      'notes:compose.view',
      (data: { description: string }) => {
        changeNote({ ...Note, ...data });
      }
    );
  }, [Note, Note.tags, Note.description, counter]); // TODO: Make a counter wrapper class!

  return (
    <div>
      {(type || typeFromParam) !== 'view' ? (
        <div>
          {' '}
          <div
            className="notes-compose"
            style={{
              opacity: ViewFilterMenu ? 0.6 : 1,
            }}
            onClick={() => {
              if (ViewFilterMenu) {
                toggleFilterMenu(false);
              }
            }}
          >
            <h1>Compose.</h1>
            <h3 onClick={() => toggleFilterMenu(true)}>Apply tags?</h3>
            <textarea
              placeholder="Flush your thoughts here."
              disabled={ViewFilterMenu}
              value={Note.description}
              onChange={(e) => {
                changeNote({ ...Note, description: e.target.value });
              }}
            />
            <button
              type="button"
              className="notes-add-task-btn"
              disabled={ViewFilterMenu}
              onClick={() => {
                const getUriRoute = () => {
                  const route = type || operationType.current;
                  return route === 'edit' ? 'update' : route;
                };
                const dataObject: Record<string, any> = {
                  description: Note.description,
                  tags: Note.tags,
                  date: new Date().toISOString(),
                };
                if (operationType.current === 'edit') {
                  dataObject.nid = (Note as any).nid;
                  dataObject.date = Note.date;
                }
                if (Note.description.trim()) {
                  axios
                    .post(
                      `${context.URI}/Notes/${getUriRoute()}`,
                      dataObject,
                      context.getAuthHeaders()
                    )
                    .then((response) => {
                      if (response.data === 'Done!') {
                        (window as any)?.electron.ipcRenderer.send(
                          'notes:compose.addNote',
                          dataObject
                        );
                      }
                      throw new Error('');
                    })
                    .catch((err) => {}); // Todo: Make a message box!
                } else {
                  deleteNote((Note as any).nid || '');
                }
              }}
            >
              Done
            </button>
          </div>
          <TagFilter
            alignment={{ top: 26, left: ViewFilterMenu ? 23 : 150 }}
            FilterSettings={{ tags: Note.tags }}
            UpdateSettings={UpdateFilterSettings}
          />
        </div>
      ) : (
        <div className="note-view">{Note.description}</div>
      )}
    </div>
  );
};

export default Compose;

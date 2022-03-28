/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TagFilter from '../Util/TagFilter';
import './Notes.css';

const Compose = () => {
  const { type } = useParams();

  const [description, updateDescription] = useState<string>('');
  const [ViewFilterMenu, toggleFilterMenu] = useState<boolean>(false);
  const [FilterSettings, updateFilterSettings] = useState<{
    tags: Array<string>;
  }>({ tags: [] });
  const [counter, updateCounter] = useState<number>(0);

  const UpdateFilterSettings = (element: { tags: Array<string> }): void => {
    updateFilterSettings(element);
    updateCounter((counter + 1) % 2);
  };

  useEffect(() => {
    (window as any).electron.ipcRenderer.on(
      'notes:compose.edit',
      (data: string) => {
        if (typeof data === 'string') {
          updateDescription(data);
        }
      }
    );
  }, []);

  return (
    <div>
      {type === 'edit' ? (
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
              value={description}
              onChange={(e) => {
                updateDescription(e.target.value);
              }}
            />
            <button
              type="button"
              className="notes-add-task-btn"
              disabled={ViewFilterMenu}
              onClick={() => {
                (window as any)?.electron.ipcRenderer.send(
                  'notes:compose.addNote',
                  {
                    description,
                    tags: FilterSettings.tags,
                    date: new Date().toISOString(),
                  }
                );
              }}
            >
              Done
            </button>
          </div>
          <TagFilter
            alignment={{ top: 26, left: ViewFilterMenu ? 23 : 150 }}
            FilterSettings={FilterSettings}
            UpdateSettings={UpdateFilterSettings}
          />
        </div>
      ) : (
        <div className="note-view">{description}</div>
      )}
    </div>
  );
};

export default Compose;

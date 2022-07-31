/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState, useEffect, useContext } from 'react';
import { v4 as uuid } from 'uuid';
import Main from 'renderer/context/main';
import axios from 'axios';
import Filter from './Filter';
import NoteIcon from '../../assets/note.jpg';
import EditIcon from '../../assets/edit.png';
import ViewIcon from '../../assets/view.png';
import './Notes.css';

type Note = { description: string; tags: Array<string>; date: string };
type FilterSettings = {
  tags: Array<string>;
  duration: { from: string | null; to: string | null };
};

const Notes = () => {
  const context = useContext(Main);
  const MIN_DESCRIPTION_CHAR = 60;
  const [notesList, updateNotesList] = useState<Array<Note>>([
    /*     {
      description:
        'Paragraphs are the building blocks of papers. Many students define paragraphs in terms of length: a paragraph is a group of at least five sentences, a paragraph is...',
      tags: ['general', 'lifestyle', 'random'],
      date: new Date().toISOString(),
    },
    {
      description:
        'Paragraphs are the building blocks of papers. Many students define paragraphs in terms of length: a paragraph is a group of at least five sentences, a paragraph is...',
      tags: ['gaming', 'awesomeness', 'ultra'],
      date: new Date().toISOString(),
    },
    {
      description:
        "Programming is a very fun activity. I think I can do that every day and night as long as it's fun, and the awesome part here is that it is almost always is fun to do it.",
      tags: ['programming', 'coding'],
      date: new Date(2020, 5, 10).toISOString(),
    }, */
  ]);
  const [originalList, updateOrgList] = useState<Array<Note> | null>(null);
  const [ViewFilterMenu, toggleFilterMenu] = useState<boolean>(true);
  const [searchQuery, updateSearchQuery] = useState<string>('');
  const [FilterSettings, updateFilterSettings] = useState<FilterSettings>({
    tags: [],
    duration: { from: null, to: null },
  });
  const [lastSearchResults, updateLastSearchResults] = useState<
    Record<string, any>
  >({
    lastSearchedQuery: searchQuery,
    lastFilterSettings: {
      tags: [],
      duration: { from: null, to: null },
    },
  });
  const [fetchedData, updateFetchState] = useState<boolean>(false);
  const [counter, updateCounter] = useState<number>(0);

  const doesTagExist = (target: Array<string>): boolean => {
    const o: Record<string, boolean> = {};
    FilterSettings.tags.forEach((i) => {
      o[i] = true;
    });
    for (let i = 0; i < target.length; i += 1) {
      if (o[target[i]] === true) {
        return true;
      }
    }
    return false;
  };

  const doesItemExistInBetween = (date: string): boolean => {
    if (!FilterSettings.duration.from && !FilterSettings.duration.to) {
      return false;
    }
    const from = new Date(
      FilterSettings.duration.from || new Date().toISOString()
    );
    const to = new Date(FilterSettings.duration.to || new Date().toISOString());
    if (from > to) {
      console.error("from can't be greater than to!");
      return false;
    }
    const noteDate = new Date(date);
    return noteDate >= from && noteDate <= to;
  };

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
        {element.length > MIN_DESCRIPTION_CHAR ? '...' : ''}
      </h2>
    );
  };

  const highlightSelectedTags = (element: string) => {
    if (!doesTagExist([element])) return element;
    return (
      <span
        style={{
          display: 'inline',
          background: 'crimson',
          width: '100%',
          color: 'white',
        }}
      >
        {element}
      </span>
    );
  };

  const UpdateFilterSettings = (settings: FilterSettings) => {
    updateFilterSettings(settings);
    updateCounter((counter + 1) % 2);
  };

  const initiateSearchOperation = (): void => {
    if (
      searchQuery.trim() !== '' ||
      FilterSettings.tags.length !== 0 ||
      FilterSettings.duration.from !== null ||
      FilterSettings.duration.to !== null
    ) {
      if (
        // Doing this check to prevent an infinite loop.
        searchQuery === lastSearchResults.lastSearchedQuery &&
        FilterSettings.tags.join('|') ===
          lastSearchResults.lastFilterSettings.tags.join('|') &&
        lastSearchResults.lastFilterSettings.duration.from ===
          FilterSettings.duration.from &&
        lastSearchResults.lastFilterSettings.duration.to ===
          FilterSettings.duration.to
      ) {
        if (
          FilterSettings.tags.length === 0 &&
          FilterSettings.duration.from === null &&
          FilterSettings.duration.to === null &&
          searchQuery.trim() === ''
        ) {
          updateNotesList(originalList || []);
        }
        return;
      }
      const notes = originalList || [];
      const result: Array<Note> = [];
      notes.forEach((item: Note): void => {
        if (
          (item.description.includes(searchQuery) &&
            searchQuery.trim() !== '') ||
          doesTagExist(item.tags) ||
          doesItemExistInBetween(item.date)
        ) {
          result.push(item);
        }
      });
      updateLastSearchResults({
        lastFilterSettings: JSON.parse(JSON.stringify(FilterSettings)),
        lastSearchedQuery: searchQuery,
      });
      updateNotesList(result);
    } else if ((originalList || []).length !== notesList.length) {
      updateNotesList(originalList || []);
    }
  };

  const fetchNotesFromAPI = (): void => {
    if (fetchedData) {
      return;
    }
    axios
      .get(`${context.URI}/Notes/`, context.getAuthHeaders())
      .then((response) => {
        updateFetchState(true);
        return updateNotesList(response.data);
      })
      .catch((err) => {
        context.RefreshAccessToken(err);
      });
  };

  useEffect(() => {
    if (
      originalList === null ||
      (originalList || []).length < notesList.length
    ) {
      updateOrgList(notesList);
    }
    initiateSearchOperation();
    fetchNotesFromAPI();
    console.log('Running....!');
  }, [
    FilterSettings.duration.from,
    FilterSettings.duration.to,
    FilterSettings.tags,
    originalList,
    notesList,
    searchQuery,
    counter,
  ]);

  return (
    <div>
      <Filter
        flag={!ViewFilterMenu}
        alignment={{
          top: 102,
          left: 29,
        }}
        FilterSettings={FilterSettings}
        UpdateFilterSettings={UpdateFilterSettings}
        doesTagExist={doesTagExist}
        includeDurationCheck
      />
      <div className="notes">
        <div className="notes-header">
          <h1
            style={{
              opacity: !ViewFilterMenu ? 0.6 : 1,
              pointerEvents: !ViewFilterMenu ? 'none' : 'all',
            }}
          >
            Notes
          </h1>
          <div className="notes-searcher">
            <input
              type="text"
              placeholder="Search Notes."
              disabled={!ViewFilterMenu || (originalList || []).length === 0}
              value={searchQuery}
              onChange={(e): void => {
                updateSearchQuery(e.target.value);
              }}
            />
            <p
              onClick={() => {
                toggleFilterMenu(!ViewFilterMenu);
              }}
              style={{
                opacity: (originalList || []).length === 0 ? 0.7 : 1,
                pointerEvents:
                  (originalList || []).length === 0 ? 'none' : 'all',
              }}
            >
              Filter
            </p>
          </div>
        </div>
        <div
          className="notes-catalogue"
          style={{
            opacity: !ViewFilterMenu ? 0.6 : 1,
            pointerEvents: !ViewFilterMenu ? 'none' : 'all',
          }}
        >
          {(originalList || []).length > 0 ? (
            notesList.map((note: Note) => {
              return (
                <div className="note-card" key={uuid()}>
                  <div className="timeAndicons">
                    <h3>{new Date(note.date).toLocaleDateString()}</h3>
                    <div>
                      <img
                        src={ViewIcon}
                        alt="view"
                        onClick={() => {
                          (window as any)?.electron?.ipcRenderer?.send(
                            'notes:compose',
                            {
                              type: 'view',
                              description: note.description,
                            }
                          );
                        }}
                      />
                      <img
                        src={EditIcon}
                        alt="edit"
                        onClick={() => {
                          console.log(note);
                          (window as any)?.electron?.ipcRenderer?.send(
                            'notes:compose',
                            {
                              type: 'edit',
                              note,
                              Auth: context.AuthInfo,
                            }
                          );
                        }}
                      />
                    </div>
                  </div>
                  {highlightSearchedResults(
                    note.description.substring(
                      0,
                      Math.min(
                        MIN_DESCRIPTION_CHAR,
                        note.description.length - 1
                      )
                    )
                  )}
                  <div className="note-tags">
                    {note.tags.map((tag: string) => {
                      return <p key={uuid()}>{highlightSelectedTags(tag)}</p>;
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="notes-empty">
              <h3>
                Wanna note down something? Just press the '+' to get started!
              </h3>
              <img src={NoteIcon} alt="Notes" />
            </div>
          )}
        </div>
      </div>
      <button
        className="notes-floater-btn"
        type="button"
        onClick={() => {
          (window as any)?.electron?.ipcRenderer?.send('notes:compose', {
            type: 'add',
            Auth: context.AuthInfo,
          });
          (window as any)?.electron?.ipcRenderer?.once(
            'notes:addNote',
            (data: Note) => {
              const notes = notesList;
              notes.push(data);
              updateNotesList(notes);
              updateCounter((counter + 1) % 2);
            }
          );
        }}
      >
        +
      </button>
    </div>
  );
};

export default Notes;

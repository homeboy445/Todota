/* eslint-disable */
import { useState, useEffect, useContext } from 'react';
import { v4 as uuid } from 'uuid';
import './Todo.css';
import TodoImage from '../../assets/todo.jpg';
import EditIcon from '../../assets/edit.png';
import Filter from '../Notes/Filter';
import Main from 'renderer/context/main';
import axios from 'axios';

type Task = {
  task: string;
  date: string;
  priority: string;
  tags: Array<string>;
};

const Todo = () => {
  const context = useContext(Main);
  const [fetchResults, updateStatus] = useState<boolean>(true);
  const [flag, toggle] = useState<Record<string, number>>({ index: -1 });
  const [ViewFilterMenu, toggleFilterMenu] = useState<boolean>(false);
  const [taskList, updateList] = useState<Array<Task>>([]);
  const [originalList, updateOrgList] = useState<Array<Task>>([]);
  const [counter, updateCounter] = useState<number>(0);
  const [canUndo, updateUndoStatus] = useState<Array<Record<string, any>>>([]);
  const [taskHash, updateHash] = useState<Record<string, Task>>({});
  const [pauseCheckList, updatePauseStatus] = useState<boolean>(false);
  const [FilterSettings, updateFilterSettings] = useState<{
    tags: Array<string>;
  }>({ tags: [] });
  const [lastSearched, updateLastSearched] = useState<{
    tags: Array<string>;
  }>({ tags: [] });

  const doesTagExist = (element: Array<string>): boolean => {
    const o: Record<string, boolean> = {};
    FilterSettings.tags.forEach((i: string) => (o[i] = true));
    for (let idx = 0; idx < element.length; idx++) {
      if (o[element[idx]]) return true;
    }
    return false;
  };

  const initiateSearchOperation = () => {
    if (FilterSettings.tags.length !== 0) {
      if (FilterSettings.tags.join('|') === lastSearched.tags.join('|')) return;
      const results: Array<Task> = [];
      originalList.map((item: Task) => {
        if (doesTagExist(item.tags || [])) {
          results.push(item);
        }
      });
      updateList(results);
    } else {
      if (originalList.length > taskList.length) {
        updateList(originalList);
      }
    }
  };

  const fetchData = () => {
    if (fetchResults && context.AuthInfo.AccessToken) {
      console.log('fetching...');
      axios
        .get(`${context.URI}/Todos`, context.getAuthHeaders())
        .then((response) => {
          console.log(response.data);
          updateList(response.data);
          updateStatus(false);
        })
        .catch((err) => {
          context.RefreshAccessToken();
        });
    }
  };

  useEffect(() => {
    if (originalList.length < taskList.length) {
      updateOrgList(taskList);
    }
    if (Object.keys(taskHash).length < taskList.length) {
      const o: Record<string, any> = taskHash || {};
      taskList.forEach((item: Task): any => {
        o[item.date] = item;
      });
      updateHash(o);
    }
    initiateSearchOperation();
    fetchData();
  }, [
    taskList,
    flag,
    counter,
    canUndo,
    ViewFilterMenu,
    FilterSettings.tags,
    context.AuthInfo.status,
    context.AuthInfo.AccessToken,
  ]);

  const getDate = (): any => {
    const date = new Date().toLocaleDateString().split('/');
    const months: Record<number, string> = {
      1: 'Jan',
      2: 'Feb',
      3: 'Mar',
      4: 'Apr',
      5: 'May',
      6: 'Jun',
      7: 'Jul',
      8: 'Aug',
      9: 'Sep',
      10: 'Oct',
      11: 'Nov',
      12: 'Dec',
    };
    return (
      <h2 className="todo-date">
        <span>{date[0]}</span>
        {` ${months[parseInt(date[1], 10)]}, ${date[2]}`}
      </h2>
    );
  };

  return (
    <div>
      <Filter
        flag={ViewFilterMenu}
        alignment={{ top: 90, left: 31 }}
        FilterSettings={{
          ...FilterSettings,
          duration: {
            from: null,
            to: null,
          },
        }}
        UpdateFilterSettings={function (FilterSettings_: {
          tags: string[];
          duration: { from: string | null; to: string | null };
        }): void {
          updateFilterSettings(FilterSettings_);
          updateCounter((counter + 1) % 2);
        }}
        doesTagExist={doesTagExist}
        includeDurationCheck={false}
      />
      <div
        className="todo-main"
        style={{
          opacity: ViewFilterMenu ? 0.6 : 1,
        }}
        onClick={() => {
          if (ViewFilterMenu) {
            toggleFilterMenu(false);
          }
        }}
      >
        <div className="todo-header">
          <h1>ToDos</h1>
          <div>
            {getDate()}
            <h3
              style={{
                visibility: originalList.length === 0 ? 'hidden' : 'visible',
                pointerEvents: originalList.length === 0 ? 'none' : 'all',
              }}
              onClick={() => toggleFilterMenu(true)}
            >
              Filter by tags?
            </h3>
          </div>
        </div>
        <div
          className="todo-list"
          style={{
            pointerEvents: ViewFilterMenu ? 'none' : 'all',
          }}
        >
          {originalList.length === 0 ? (
            <div className="todo-empty">
              <h3>
                Looks like the list's empty. Just press '+' to get started.
              </h3>
              <img src={TodoImage} alt="" className="todo-img" />
            </div>
          ) : (
            [...new Set(taskList)].map(
              (
                item: Record<string, string | Array<string>>,
                index: number
              ): any => {
                return (
                  <div
                    className="todo-card"
                    key={uuid()}
                    style={{
                      transform: `translateX(${
                        flag.index === index ? 110 : 0
                      }%)`,
                    }}
                  >
                    <input
                      type="checkbox"
                      disabled={pauseCheckList}
                      onClick={(): void => {
                        if (pauseCheckList) return;
                        toggle({ index: flag.index === index ? -1 : index });
                        let undo = canUndo;
                        undo.push({ id: item.date });
                        updateUndoStatus(undo);
                        const list = taskList;
                        const id = taskList[index].date;
                        list.splice(index, 1);
                        updateList(list);
                        toggle({ index: -1 });
                        updatePauseStatus(true);
                        setTimeout(() => {
                          const tasks = taskHash;
                          delete tasks[id];
                          undo = canUndo;
                          for (let idx = 0; idx < undo.length; idx++) {
                            if (undo[idx].id === id) {
                              undo.splice(idx, 1);
                              break;
                            }
                          }
                          updateHash(tasks);
                          updateUndoStatus(undo);
                          updateCounter((counter + 1) % 2);
                          updatePauseStatus(false);
                        }, 1500);
                      }}
                    />
                    <h3>{item.task}</h3>
                    <img
                      src={EditIcon}
                      alt="edit"
                      onClick={(): void => {
                        (window as any)['electron'].ipcRenderer.send(
                          'todo:open-add-task-window',
                          { ...item, AuthInfo: context.AuthInfo }
                        );
                        (window as any)['electron'].ipcRenderer.once(
                          'todo:addTask',
                          (data: Task) => {
                            const list = taskList;
                            for (let idx = 0; idx < list.length; idx++) {
                              if (list[idx].date === data.date) {
                                list[idx] = data;
                              }
                            }
                            updateList(list);
                            updateCounter((counter + 1) % 2);
                          }
                        );
                      }}
                    />
                  </div>
                );
              }
            )
          )}
          <button
            className="todo-floater-btn"
            type="button"
            onClick={() => {
              (window as any)['electron'].ipcRenderer.send(
                'todo:open-add-task-window',
                {
                  AuthInfo: { ...context.AuthInfo, status: false },
                }
              );
              (window as any)['electron'].ipcRenderer.once(
                'todo:addTask',
                (data: never) => {
                  const list = taskList;
                  list.push(data);
                  updateList(list);
                  updateCounter((counter + 1) % 2);
                }
              );
            }}
          >
            +
          </button>
          <div
            className="info-box"
            style={{
              transition: '0.5s ease-in-out',
            }}
          >
            {canUndo.map((item, index): any => {
              return (
                <p
                  style={{
                    top: `${80 - index * 2}%`,
                  }}
                  key={uuid()}
                  onClick={(): void => {
                    const task = [taskHash[item.id]];
                    setTimeout(() => {
                      const list = [...task, ...taskList];
                      list.sort((a: any, b: any): number => {
                        return new Date(a.date) > new Date(b.date) ? 1 : -1;
                      });
                      updateList(list);
                      updatePauseStatus(false);
                    }, 1000);
                  }}
                >
                  Undo
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Todo;

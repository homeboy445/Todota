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
  tid: string;
  task: string;
  date: string;
  priority: string;
  tags: Array<string>;
};

const Todo = () => {
  const context = useContext(Main);
  const [shouldFetchResults, updateStatus] = useState<boolean>(true);
  const [flag, toggle] = useState<Record<string, number>>({ index: -1 });
  const [ViewFilterMenu, toggleFilterMenu] = useState<boolean>(false);
  const [taskList, updateList] = useState<Array<Task>>([]);
  const [originalList, updateOrgList] = useState<Array<Task>>([]);
  const [counter, updateCounter] = useState<number>(0);
  const [canUndo, updateUndoStatus] = useState<Record<string, any>>({});
  const [taskHash, updateHash] = useState<Record<string, Task>>({});
  const [pauseCheckList, updatePauseStatus] = useState<boolean>(false);
  const [FilterSettings, updateFilterSettings] = useState<{
    tags: Array<string>;
  }>({ tags: [] });
  const [lastSearched, updateLastSearched] = useState<{
    tags: Array<string>;
  }>({ tags: [] });
  const [deletedTasks, updateDelList] = useState<Array<string>>([]);

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
    if (shouldFetchResults && context.AuthInfo.AccessToken) {
      axios
        .get(`${context.URI}/Todos`, context.getAuthHeaders())
        .then((response) => {
          console.log('=> ', response.data);
          updateList(response.data);
          updateStatus(false);
        })
        .catch((err) => {
          context.RefreshAccessToken();
        });
    }
  };

  const deleteTasksCompletely = (tid: string): void => {
    axios
      .delete(`${context.URI}/remove/${tid}`, context.getAuthHeaders())
      .then((response) => console.log(response.data))
      .catch((err) => {
        context.RefreshAccessToken(); //TODO: It doesn't seemingly work currently;
      });
  };

  const isTaskUnderDeletionProcess = (tid: string): boolean => {
    return canUndo[tid] === true;
  };

  const removeTask = (tid: string): void => {
    const tasks = taskList;
    for (let idx = 0; idx < tasks.length; idx++) {
      if (tasks[idx].tid === tid) {
        tasks.splice(idx, 1);
        deleteTasksCompletely(tid);
        toggle({ index: idx });
        break;
      }
    }
    updateList(tasks);
    updateCounter((counter + 1) % 2);
  };

  useEffect(() => {
    if (originalList.length < taskList.length) {
      updateOrgList(taskList);
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
                visibility:
                  originalList.length === 0 && !shouldFetchResults
                    ? 'hidden'
                    : 'visible',
                pointerEvents: originalList.length === 0 ? 'none' : 'all',
                textDecoration: shouldFetchResults ? 'none' : 'underline',
              }}
              onClick={() => toggleFilterMenu(true)}
            >
              {!shouldFetchResults ? 'Filter by tags?' : 'Loading...'}
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
            [...new Set(taskList)].map((item: Task, index: number): any => {
              return (
                <div
                  className="todo-card"
                  key={uuid()}
                  style={{
                    transform: `translateX(${flag.index === index ? 110 : 0}%)`,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={canUndo[item.tid] === true}
                    onChange={(): void => {
                      const canUndoMap = canUndo;
                      const tid = item.tid;
                      if (canUndoMap[tid]) {
                        canUndoMap[tid] = false;
                      } else {
                        canUndoMap[tid] = true;
                      }
                      updateUndoStatus(canUndoMap);
                      updateCounter((counter + 1) % 2);
                      setTimeout(() => {
                        //The user has only 2 secs to change their decision.
                        if (!canUndo[tid]) return;
                        delete canUndo[tid];
                        removeTask(tid);
                      }, 2000);
                    }}
                  />
                  <h3
                    style={{
                      textDecoration: isTaskUnderDeletionProcess(item.tid)
                        ? 'line-through'
                        : 'none',
                    }}
                  >
                    {item.task}
                  </h3>
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
                            if (list[idx].tid === data.tid) {
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
            })
          )}
          <button
            className="todo-floater-btn"
            type="button"
            onClick={() => {
              (window as any)['electron'].ipcRenderer.send(
                'todo:open-add-task-window',
                {
                  AuthInfo: {
                    ...context.AuthInfo,
                    status: true,
                    email: sessionStorage.getItem('email'),
                  },
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
        </div>
      </div>
    </div>
  );
};

export default Todo;

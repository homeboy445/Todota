/* eslint-disable react/jsx-no-bind */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import Main from 'renderer/context/main';
import TagFilter from '../Util/TagFilter';
import './Todo.css';

const AddTask = () => {
  const context = useContext(Main);
  const [description, changeDescription] = useState<string>('');
  const [priority, updatePriority] = useState<string>('null');
  const [taskTime, updateTime] = useState<Date | null>(null);
  const [FilterSettings, updateSettings] = useState<{ tags: Array<string> }>({
    tags: [],
  });
  const [ViewTagFilterMenu, toggleFilterMenu] = useState<boolean>(false);
  const [counter, updateCounter] = useState<number>(0);
  const [disableButton, toggleButton] = useState<boolean>(false);
  const [editMode, toggleEditMode] = useState<{
    status: boolean;
    additional: Record<string, string>;
  }>({ status: false, additional: {} });

  useEffect((): any => {
    (window as any).electron.ipcRenderer.on(
      'todo:addTask.edit',
      (data: any): void => {
        console.log(data);
        if (typeof data === 'object') {
          if ('task' in data) {
            console.log('@@ ', data);
            changeDescription(data.task);
            updatePriority(data.priority);
            updateTime(data.date);
            toggleEditMode({ status: true, additional: { tid: data.tid } });
          }
          context.UpdateAuthInfoState({
            status: data.AuthInfo.status,
            AccessToken: data.AuthInfo.AccessToken,
            RefreshToken: data.AuthInfo.RefreshToken,
          });
          sessionStorage.setItem('AccessToken', data.AuthInfo.AccessToken);
          sessionStorage.setItem('RefreshToken', data.AuthInfo.RefreshToken);
          sessionStorage.setItem('email', data.AuthInfo.email);
        }
      }
    );
  }, [context, context.AuthInfo.status]);

  return (
    <div>
      <TagFilter
        alignment={{
          top: 3,
          left: ViewTagFilterMenu ? 18 : 100,
        }}
        FilterSettings={JSON.parse(JSON.stringify(FilterSettings))}
        UpdateSettings={(element: { tags: string[] }): void => {
          updateSettings(element);
          updateCounter((counter + 1) % 2);
        }}
      />
      <div
        className="todo-add-task"
        style={{
          opacity: ViewTagFilterMenu ? 0.7 : 1,
        }}
        onClick={() => {
          if (ViewTagFilterMenu) {
            toggleFilterMenu(false);
          }
        }}
      >
        <h1>Add a task.</h1>
        <div className="todo-add-task-1">
          <textarea
            placeholder="Task description."
            onChange={(e) => changeDescription(e.target.value)}
            value={description}
            disabled={ViewTagFilterMenu}
          />
          <select
            onChange={(e) => updatePriority(e.target.value)}
            value={priority}
            disabled={ViewTagFilterMenu}
          >
            <option value="null">Task priority?</option>
            <option value="high">High</option>
            <option value="mid">Medium</option>
            <option value="low">Low</option>
          </select>
          <h3 onClick={() => toggleFilterMenu(true)}>Apply tags?</h3>
        </div>
        <button
          type="button"
          disabled={ViewTagFilterMenu || disableButton}
          className="todo-add-task-btn"
          onClick={() => {
            if (description.trim() === '' || priority === 'null') {
              return;
            }
            console.log('Clicked!');
            toggleButton(true);
            const Task = {
              tid: editMode.additional?.tid,
              task: description,
              priority,
              date: taskTime || new Date().toISOString(),
              tags: FilterSettings.tags,
            };
            // eslint-disable-next-line promise/catch-or-return
            axios
              .post(
                `${context.URI}/Todos/${editMode.status ? 'update' : 'add'}`,
                Task,
                context.getAuthHeaders()
              )
              .then((response) => {
                return (window as any).electron.ipcRenderer.send(
                  'todo:addTodo',
                  Task
                );
              })
              .catch((err) => {})
              .finally(() => {
                toggleButton(false);
              });
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default AddTask;

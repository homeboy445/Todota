/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { useEffect } from 'react';
import { v4 as uuid } from 'uuid';
// eslint-disable-next-line react/prop-types
const Filter = ({
  flag,
  alignment,
  FilterSettings,
  UpdateFilterSettings,
  doesTagExist,
  includeDurationCheck,
}: {
  flag: boolean;
  alignment: { top: number; left: number };
  FilterSettings: {
    tags: Array<string>;
    duration: { from: string | null; to: string | null };
  };
  UpdateFilterSettings: (FilterSettings: {
    tags: Array<string>;
    duration: { from: string | null; to: string | null };
  }) => void;
  doesTagExist: (element: Array<string>) => boolean;
  includeDurationCheck: boolean;
}) => {
  useEffect(() => {}, [
    FilterSettings.tags,
    FilterSettings.duration.from,
    FilterSettings.duration.to,
  ]);

  const getFormattedDate = (date: string) => {
    return new Date(date).toLocaleDateString().split('/').reverse().join('-');
  };

  const updateDate = (date: string, operation: string) => {
    const dateString = date.split('-');
    const settings = FilterSettings;
    if (operation === 'from') {
      settings.duration.from = new Date(
        parseInt(dateString[0], 10),
        parseInt(dateString[1], 10) - 1,
        parseInt(dateString[2], 10)
      ).toISOString();
    } else {
      settings.duration.to = new Date(
        parseInt(dateString[0], 10),
        parseInt(dateString[1], 10) - 1,
        parseInt(dateString[2], 10)
      ).toISOString();
    }
    UpdateFilterSettings(settings);
  };

  const isFilterApplied = (): boolean => {
    return !(
      FilterSettings.tags.length === 0 &&
      FilterSettings.duration.from === null &&
      FilterSettings.duration.to === null
    );
  };

  return (
    <div
      className="notes-filter"
      style={{
        transition: '0.4s',
        transform: `translateX(${flag ? alignment.left : 300}%)`,
        top: alignment.top,
        left: alignment.left,
      }}
    >
      <h3
        className="filter-clear"
        onClick={() => {
          const settings = FilterSettings;
          settings.tags = [];
          settings.duration.from = null;
          settings.duration.to = null;
          UpdateFilterSettings(settings);
        }}
        style={{
          visibility: !isFilterApplied() ? 'hidden' : 'visible',
          pointerEvents: !isFilterApplied() ? 'none' : 'all',
        }}
      >
        clear
      </h3>
      <h1>Filter</h1>
      <div className="notes-filter-1">
        <div className="filter-header">
          <h2>Tags</h2>
          <div className="notes-filter-line"> </div>
        </div>
        <div className="notes-filter-tags">
          {['general', 'lifestyle', 'random', 'programming', 'education'].map(
            (tag) => {
              const status = doesTagExist([tag]);
              return (
                <p
                  key={uuid()}
                  style={{
                    cursor: 'pointer',
                    background: status ? 'royalblue' : 'white',
                    color: status ? 'white' : 'black',
                  }}
                  onClick={() => {
                    const settings = FilterSettings;
                    if (!doesTagExist([tag])) {
                      settings.tags.push(tag);
                    } else {
                      for (let i = 0; i < settings.tags.length; i += 1) {
                        if (settings.tags[i] === tag) {
                          settings.tags.splice(i, 1);
                        }
                      }
                    }
                    UpdateFilterSettings(settings);
                  }}
                >
                  {tag}
                </p>
              );
            }
          )}
        </div>
      </div>
      {includeDurationCheck ? (
        <div className="notes-filter-2">
          <div className="filter-header">
            <h2>Duration</h2>
            <div className="notes-filter-line"> </div>
          </div>
          <div className="notes-filter-dates">
            <input
              type="date"
              value={getFormattedDate(
                FilterSettings.duration.from || new Date().toISOString()
              )}
              onChange={(e) => {
                updateDate(e.target.value, 'from');
              }}
            />
            <h2>To</h2>
            <input
              type="date"
              value={getFormattedDate(
                FilterSettings.duration.to || new Date().toISOString()
              )}
              onChange={(e) => {
                updateDate(e.target.value, 'to');
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Filter;

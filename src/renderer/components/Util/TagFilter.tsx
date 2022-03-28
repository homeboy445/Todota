/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import ReactTooltip from 'react-tooltip';
import './TagFilter.css';

const TagFilter = (props: {
  alignment: { top: number; left: number };
  FilterSettings: { tags: Array<string> };
  UpdateSettings: (element: { tags: Array<string> }) => void;
}) => {
  const { alignment, FilterSettings, UpdateSettings } = props;

  const [tags, updateTags] = useState<Set<string>>(
    new Set(['general', 'lifestyle', 'random', 'programming', 'education'])
  );
  const [storeTags, updateStore] = useState<Set<string> | null>(null);
  const [preDefinedTags, updatePreDefinedTags] = useState<Set<string>>( // Would be used for detecting if addition of tags be prohibited or not;
    new Set(['general', 'lifestyle', 'random', 'programming', 'education'])
  );
  const [customTagInput, updateInput] = useState<string>('');
  const [tagSearch, updateTagSearch] = useState<string>('');
  const [lastSearchedTag, updateLastSearched] = useState<string>('');

  const SelectTag = (tagName: string): void => {
    const settings = FilterSettings;
    let idx = -1;
    for (let i = 0; i < settings.tags.length; i += 1) {
      if (settings.tags[i] === tagName) {
        idx = i;
        break;
      }
    }
    if (idx !== -1) {
      settings.tags.splice(idx, 1);
    } else {
      settings.tags.push(tagName);
    }
    UpdateSettings(settings);
  };

  const highlightSearchedTag = (element: string, status: boolean) => {
    const idx = element.lastIndexOf(tagSearch);
    if (idx === -1 || element.trim() === '')
      return (
        <p
          key={uuid()}
          style={{
            background: status ? 'royalblue' : 'white',
            color: status ? 'white' : 'black',
          }}
          onClick={() => SelectTag(element)}
          data-tip={element}
        >
          {element}
        </p>
      );
    return (
      <p
        key={uuid()}
        style={{
          background: status ? 'royalblue' : 'white',
          color: status ? 'white' : 'black',
        }}
        onClick={() => SelectTag(element)}
        data-tip={element}
      >
        {element.substring(0, idx - 1)}
        <span style={{ display: 'inline', background: 'yellow' }}>
          {tagSearch}
        </span>
        {element.substring(idx + tagSearch.length, element.length)}
      </p>
    );
  };

  useEffect(() => {
    if (storeTags === null || (storeTags?.size || 1e9) < tags.size) {
      updateStore(tags);
    }
    const TagSearch: string = tagSearch.trim();
    if (TagSearch !== '') {
      if (lastSearchedTag.trim() === TagSearch.trim()) return;
      const $tags = storeTags;
      const result: Set<string> = new Set();
      [...($tags || [])].forEach((item): void => {
        if (item.includes(TagSearch.trim())) {
          result.add(item);
        }
      });
      updateTags(result);
      updateLastSearched(TagSearch);
    } else if ((storeTags?.size || -1e9) > tags.size) {
      updateTags(storeTags || new Set());
    }
  }, [tags, tagSearch, FilterSettings.tags.length]);

  return (
    <div
      className="tag-filter"
      style={{
        top: `${alignment.top}%`,
        left: `${alignment.left}%`,
        transition: '0.3s ease',
      }}
    >
      <h1>Apply Tags.</h1>
      <div className="tag-filter-1">
        <div className="tag-filter-header">
          <div className="tag-searcher">
            <h3>Pre-Defined</h3>
            <input
              type="text"
              placeholder="search tags."
              value={tagSearch}
              onChange={(e) => updateTagSearch(e.target.value)}
            />
          </div>
          <div className="tag-filter-line"> </div>
        </div>
        <div className="tag-filter-list">
          <ReactTooltip />
          {[...tags].map((tag: string) => {
            const status: boolean =
              FilterSettings.tags.find((i) => i === tag) === tag;
            return highlightSearchedTag(tag, status);
          })}
        </div>
      </div>
      <div className="tag-filter-2">
        <div className="tag-filter-header">
          <h3>Custom</h3>
          <div className="tag-filter-line"> </div>
        </div>
        <div className="tag-filter-input">
          <input
            type="text"
            placeholder="Upto three."
            value={customTagInput}
            onChange={(e) => {
              updateInput(e.target.value);
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (
                tags.size - preDefinedTags.size >= 3 ||
                customTagInput.trim() === ''
              ) {
                return;
              }
              const t = tags;
              t.add(customTagInput.trim());
              updateTags(t);
              SelectTag(customTagInput);
              updateInput('');
            }}
          >
            add
          </button>
        </div>
      </div>
    </div>
  );
};

export default TagFilter;

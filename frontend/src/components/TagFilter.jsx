function TagFilter({ tags, activeTag, onSelect }) {
  return (
    <div className="tag-filter">
      <button className={!activeTag ? 'tag active' : 'tag'} onClick={() => onSelect(null)}>
        ALL
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          className={activeTag === tag ? 'tag active' : 'tag'}
          onClick={() => onSelect(tag)}
        >
          {tag.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default TagFilter;

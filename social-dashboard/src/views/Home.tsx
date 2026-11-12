import type { Analysis } from '../analysis/analyze';
import type { Recommendation } from '../analysis/recommendations';
import type { FollowerInfo, Topic } from '../types';
import { AtAGlance } from './Overview';
import { BigPictureView } from './BigPicture';
import { LocalSection } from './Local';
import type { LocalData } from '../import/local';

/** Numbers first (for the chosen period), then what they mean (last 12 months). */
export function Home({
  a,
  year,
  recs,
  followers,
  topics,
  rangeDays,
  local,
  onSeeAll,
}: {
  a: Analysis;
  year: Analysis;
  recs: Recommendation[];
  followers: FollowerInfo[];
  topics: Topic[];
  rangeDays: number;
  local?: LocalData;
  onSeeAll: () => void;
}) {
  return (
    <div className="home">
      <div className="home-band">
        <h2 className="home-heading">At a glance</h2>
        <span className="home-sub">{rangeDays ? `Last ${rangeDays} days, compared with the ${rangeDays} days before` : 'All time'} · change it with the buttons above</span>
      </div>
      <AtAGlance a={a} recs={recs} followers={followers} onSeeAll={onSeeAll} />
      <LocalSection data={local} />

      <div className="home-band" style={{ marginTop: 32 }}>
        <h2 className="home-heading">The big picture</h2>
        <span className="home-sub">Last 12 months · what's working and what to do about it</span>
      </div>
      <BigPictureView a={year} topics={topics} />
    </div>
  );
}

function isPlanValid(plan) {
  const planLevel = ['Beginner', 'Intermediate', 'Advanced'];
  const planPublicType = ['public', 'restricted', 'private'];

  if (typeof plan.name !== 'string') return 'Unexpected name type';
  if (!planPublicType.includes(plan.publicType)) return 'Unexpected public type';
  if (!Array.isArray(plan.allowedUsers)) return 'Unexpected allowed users';
  if (!Array.isArray(plan.days)) return 'Unexpected days type';

  for (let day of plan.days) {
    if (typeof day.id !== 'string') return 'Unexpected day id type';
    if (typeof day.name !== 'string') return 'Unexpected day name type';
    if (!Array.isArray(day.exercises)) return 'Unexpected exercises type';

    for (let exercise of day.exercises) {
      if (typeof exercise.id !== 'string') return 'Unexpected exercise id type';
      if (typeof exercise.loadIncrease !== 'number') return 'Unexpected load increase type';
      if (!Array.isArray(exercise.repsRange)) return 'Unexpected reps range type';
      if (exercise.repsRange[0] > exercise.repsRange[1]) return 'Max reps range is lower than min reps range';
      if (!Array.isArray(exercise.series)) return 'Unexpected series type';

      for (let series of exercise.series) {
        if (typeof series.reps !== 'number') return 'Unexpected series reps type';
        if (series.reps < exercise.repsRange[0]) return 'Reps are lower than min reps range';
        if (series.reps > exercise.repsRange[1]) return 'Reps are higher than max reps range';
        if (typeof series.weight !== 'number') return 'Unexpected series weight type';
      }
    }
  }

  return true;
}

module.exports = { isPlanValid };

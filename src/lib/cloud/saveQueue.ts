export function createSaveQueue<T>(save: (value:T)=>Promise<void>) {
  let tail: Promise<void> = Promise.resolve();
  return (value:T) => {
    const task = tail.catch(()=>{}).then(()=>save(value));
    tail = task;
    return task;
  };
}

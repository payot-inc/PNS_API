const Router = require("express").Router;
const router = Router();

router.get("/", (req, res, next) => {
  try {
    res.sendFile('index.html');
  } catch (error) {
    next(error);
  }
});

router.get('/group', async (req, res, next) => {
  const data = db.get('group').value();
  res.json(data);
});

// 그룹 조회
router.get('/group/:id', async (req, res, next) => {
  const { id } = req.params;
  const data = db.get('group').find({ id: Number(id) }).value();

  res.json(data);
});

// 장비조회
router.get('/group/:id/machines', async (req, res, next) => {
  const { id } = req.params;
  const machines = db.get('machine').filter({ groupId: Number(id) }).value();

  res.json(machines);
});

// 장비 고장 등록
router.put('/machine/:mac/broken', async (req, res, next) => {
  const { mac } = req.params;
  const { password, status } = req.body;

  if (password !== '2902') res.status(400).json({ message: '비밀번호가 맞지 않습니다', code: 1 });
  else {
    const machine = db.get('machine')
      .chain()
      .find({ mac })
      .assign({ isRunning: false, isBroken: status, stopTime: Date.now() })
      .write();
    
    event.next({ method: 'update', group: machine.groupId });
    res.json(machine);
  }
});

router.use((err, req, res, next) => {
  res.status(500).json(err);
});

module.exports = router;

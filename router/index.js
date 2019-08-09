const Router = require("express").Router;
const router = Router();

router.get("/", (req, res, next) => {
  try {
    ws.send('HELLO');
    res.send('kkkkk');
  } catch (error) {
    next(error);
  }
});

router.get('/machines/group/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
  } catch (error) {
    next(error);
  }
});

router.use((err, req, res, next) => {
  res.status(500).json(error);
});

module.exports = router;

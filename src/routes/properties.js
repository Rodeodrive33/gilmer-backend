router.get("/", authenticate, async (req,res)=>{

  const properties = await prisma.property.findMany({
    where:{ clientId: req.user.id }
  });

  res.json(properties);
});

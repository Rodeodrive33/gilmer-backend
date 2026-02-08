router.post("/onboard", authenticate, async (req,res)=>{

  const { email, name, propertyId, startDate } = req.body;

  const tenant = await prisma.user.create({
    data:{
      email,
      name,
      role:"TENANT"
    }
  });

  const lease = await prisma.lease.create({
    data:{
      tenantId: tenant.id,
      propertyId,
      startDate: new Date(startDate)
    }
  });

  await prisma.activityLog.create({
    data:{
      action:`Tenant onboarded: ${name}`,
      userId:req.user.id
    }
  });

  res.json({ tenant, lease });
});

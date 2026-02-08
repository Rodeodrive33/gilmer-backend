router.get("/", authenticate, async (req,res)=>{

  const payments = await prisma.payment.findMany({
    where:{
      lease:{
        property:{
          clientId: req.user.id
        }
      }
    }
  });

  res.json(payments);
});

import { createLedgerEntry } from "../services/ledgerService.js";
await createLedgerEntry({
  type:"CREDIT",
  amount: payment.amount,
  description:"Tenant Rent Payment",
  propertyId: lease.propertyId,
  clientId: lease.property.clientId
});

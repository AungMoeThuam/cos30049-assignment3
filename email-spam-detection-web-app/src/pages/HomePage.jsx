import { useNavigate } from "react-router"
import {
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Box,
  Paper,
} from "@mui/material"

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <Box sx={{ width: "100%" }}>
      {/* Hero Section */}
      <Box 
        component="section" 
        sx={{ 
          textAlign: "center", 
          maxWidth: "768px", 
          mx: "auto", 
          mb: 8, 
          pt: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontFamily: '"Manrope", sans-serif', 
            fontWeight: 800, 
            color: "slate.900",
            lineHeight: 1.2,
            mb: 3
          }}
        >
          AI-Powered Email Spam & Phishing Classifier
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ 
            fontFamily: '"Manrope", sans-serif', 
            fontWeight: 400, 
            mb: 4, 
            lineHeight: 1.6 
          }}
        >
          Secure your inbox with real-time spam prediction. Our platform uses advanced machine learning models to analyze copy-pasted text, file uploads, and CSV batches instantly.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={() => navigate("/spam-check")}
          sx={{ 
            borderRadius: "8px", 
            px: 4, 
            py: 1.5,
            fontSize: "16px",
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 600,
            textTransform: "none",
            boxShadow: 2,
            "&:hover": {
              bgcolor: "grey.800"
            }
          }}
        >
          Analyze Email
        </Button>
      </Box>

      {/* ML Models Section */}
      <Box component="section" sx={{ mb: 8 }}>
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom 
          sx={{ 
            fontFamily: '"Manrope", sans-serif', 
            fontWeight: 700, 
            borderBottom: "1px solid", 
            borderColor: "divider", 
            pb: 1.5,
            mb: 4
          }}
        >
          Detection Models
        </Typography>
        <Grid container spacing={3}>
          {[
            {
              title: "Naive Bayes",
              desc: "Probabilistic model estimating word-occurrence spam likelihoods."
            },
            {
              title: "K-Means Clustering",
              desc: "Unsupervised model grouping similar emails based on centroid distances."
            },
            {
              title: "Logistic Regression",
              desc: "Linear classifier modeling spam probability using extracted numeric features."
            },
            {
              title: "Linear SVM",
              desc: "Support Vector Machine maximizing spacing between spam and safe bounds."
            }
          ].map((model) => (
            <Grid size={{ xs: 12, md: 6 }} key={model.title}>
              <Card 
                variant="outlined" 
                sx={{ 
                  borderRadius: "8px",
                  height: "100%",
                  transition: "background-color 0.2s",
                  "&:hover": {
                    bgcolor: "action.hover"
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    gutterBottom 
                    sx={{ 
                      fontFamily: '"Manrope", sans-serif', 
                      fontWeight: 700,
                      mb: 1.5
                    }}
                  >
                    {model.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ 
                      fontFamily: '"Manrope", sans-serif',
                      lineHeight: 1.5
                    }}
                  >
                    {model.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Feature Engineering Section */}
      <Box component="section" sx={{ mb: 8 }}>
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 4, 
            bgcolor: "grey.50", 
            borderRadius: "8px", 
            borderColor: "divider" 
          }}
        >
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontFamily: '"Manrope", sans-serif', 
              fontWeight: 700,
              mb: 2
            }}
          >
            Feature Engineering Pipeline
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              fontFamily: '"Manrope", sans-serif', 
              mb: 4,
              maxWidth: "800px" 
            }}
          >
            Our sophisticated classification engine utilizes TF-IDF vectorization alongside 9 custom numeric features to accurately discern malicious intent.
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {[
              "URLs",
              "Exclamation Marks",
              "Question Marks",
              "Dollar Signs",
              "ALL CAPS",
              "Numeric Values",
              "Emojis",
              "Capital Ratio",
              "Word Count"
            ].map((feature) => (
              <Chip
                key={feature}
                label={feature}
                variant="outlined"
                sx={{
                  bgcolor: "background.paper",
                  borderColor: "divider",
                  fontFamily: '"Manrope", sans-serif',
                  fontWeight: 500,
                  fontSize: "13px",
                  px: 1,
                  py: 2
                }}
              />
            ))}
          </Box>
        </Paper>
      </Box>

      {/* About & Team Section */}
      <Box component="section">
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontFamily: '"Manrope", sans-serif', 
              fontWeight: 700,
              mb: 1
            }}
          >
            Institutional Research
          </Typography>
          <Typography 
            variant="subtitle2" 
            color="text.secondary" 
            sx={{ 
              fontFamily: '"Manrope", sans-serif', 
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase" 
            }}
          >
            COS30049 - Cloud Computing, Swinburne University of Technology
          </Typography>
        </Box>
        
        <Grid container spacing={3}>
          {[
            {
              name: "John Doe",
              role: "Lead AI Engineer",
              desc: "Responsible for model training, selection, and pipeline performance."
            },
            {
              name: "Jane Smith",
              role: "Frontend Developer",
              desc: "Responsible for the responsive React dashboard, theme, and interactive Heatmap."
            },
            {
              name: "Alex Johnson",
              role: "Backend Developer",
              desc: "Responsible for API endpoints, file uploads, and CSV parsing."
            }
          ].map((member) => (
            <Grid size={{ xs: 12, md: 4 }} key={member.name}>
              <Card variant="outlined" sx={{ borderRadius: "8px", height: "100%" }}>
                <CardContent sx={{ p: 4, display: "flex", flexDirection: "column", height: "100%" }}>
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    sx={{ 
                      fontFamily: '"Manrope", sans-serif', 
                      fontWeight: 700 
                    }}
                  >
                    {member.name}
                  </Typography>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary" 
                    sx={{ 
                      fontFamily: '"Manrope", sans-serif', 
                      mb: 3, 
                      fontWeight: 500 
                    }}
                  >
                    {member.role}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      fontFamily: '"Manrope", sans-serif',
                      lineHeight: 1.6
                    }}
                  >
                    {member.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}
